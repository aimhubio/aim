import logging
import os
from pathlib import Path

import aimrocks

from typing import Iterator, Optional, Tuple

from aim.ext.cleanup import AutoClean
from aim.ext.exception_resistant import exception_resistant
from aim.storage.locking import SoftFileLock, NoopLock
from aim.storage.types import BLOB
from aim.storage.container import Container, ContainerKey, ContainerValue, ContainerItemsIterator
from aim.storage.prefixview import PrefixView
from aim.storage.containertreeview import ContainerTreeView
from aim.storage.treeview import TreeView


logger = logging.getLogger(__name__)

BLOB_SENTINEL = b''
BLOB_DOMAIN = b'BLOBS\xfe'


class RocksAutoClean(AutoClean):
    PRIORITY = 60

    def __init__(self, instance: 'RocksContainer') -> None:
        """
        Prepare the `RocksContainer` for automatic cleanup.

        Args:
            instance: The `RocksContainer` instance to be cleaned up.
        """
        super().__init__(instance)
        self._lock = None
        self._db = None

    def _close(self):
        """
        Close the RocksDB instances, flush memtables and WAL.
        Finally, release the lock.
        """
        if self._lock is not None:
            if self._db is not None:
                self._db.flush()
                self._db.flush_wal()
                self._db = None
            self._lock.release()
            self._lock = None
        if self._db is not None:
            self._db = None


class RocksContainer(Container):
    """
    TODO Rocks-specific docs
    """
    def __init__(
        self,
        path: str,
        read_only: bool = False,
        wait_if_busy: bool = False,
        **extra_options
    ) -> None:
        self._resources: RocksAutoClean = None

        self.path = Path(path)
        self.read_only = read_only
        self._db_opts = dict(
            create_if_missing=True,
            paranoid_checks=False,
            keep_log_file_num=10,
            skip_stats_update_on_db_open=True,
            skip_checking_sst_file_sizes_on_db_open=True,
            max_open_files=-1,
            write_buffer_size=1024 * 1024,  # 1MB
            db_write_buffer_size=1024 * 1024,  # 1MB
            max_write_buffer_number=1,
            target_file_size_base=64 * 1024 * 1024,  # 64MB
            max_background_compactions=4,
            level0_file_num_compaction_trigger=8,
            level0_slowdown_writes_trigger=17,
            level0_stop_writes_trigger=24,
            num_levels=4,
            max_bytes_for_level_base=512 * 1024 * 1024,  # 512MB
            max_bytes_for_level_multiplier=8,
        )
        self._extra_opts = extra_options
        # opts.allow_concurrent_memtable_write = False
        # opts.memtable_factory = aimrocks.VectorMemtableFactory()
        # opts.table_factory = aimrocks.PlainTableFactory()
        # opts.table_factory = aimrocks.BlockBasedTableFactory(block_cache=aimrocks.LRUCache(67108864))
        # opts.write_buffer_size = 67108864
        # opts.arena_block_size = 67108864

        self._wait_if_busy = wait_if_busy  # TODO implement
        self._lock_path: Optional[Path] = None

        self._resources = RocksAutoClean(self)

        progress_dir = self.path.parent.parent / 'progress'
        self._progress_path = progress_dir / self.path.name
        if not self.read_only:
            progress_dir.mkdir(parents=True, exist_ok=True)
            self._progress_path.touch(exist_ok=True)

        self.db
        # TODO check if Containers are reopenable

    # The following properties are linked to self._resources to
    # ensure that the resources are closed when the container gone.

    def get_lock_cls(self):
        """Default locking is no-op. Container locking to be handled externally."""
        return NoopLock

    @property
    def _db(self):
        return self._resources._db

    @_db.setter
    def _db(self, value):
        self._resources._db = value

    @property
    def _lock(self):
        return self._resources._lock

    @_lock.setter
    def _lock(self, value):
        self._resources._lock = value

    @property
    def db(self) -> aimrocks.DB:
        if self._db is not None:
            return self._db

        logger.debug(f'opening {self.path} as aimrocks db')
        if not self.read_only:
            lock_path = prepare_lock_path(self.path)
            self._lock_path = lock_path
            timeout = self._extra_opts.get('timeout', 10)
            lock_cls = self.get_lock_cls()
            self._lock = lock_cls(self._lock_path, timeout)
            self._lock.acquire()
        else:
            self.optimize_for_read()

        self._db = aimrocks.DB(str(self.path),
                               aimrocks.Options(**self._db_opts),
                               read_only=self.read_only)

        return self._db

    def finalize(self, index: Container):
        """Finalize the Container.

        Store the collection of `(key, value)` records in the :obj:`Container`
        `index` for fast reads.
        """
        if not self._progress_path:
            return

        for k, v in self.items():
            index[k] = v

        if self._progress_path.exists():
            self._progress_path.unlink()
        self._progress_path = None

    def close(self):
        """Close all the resources."""
        if self._resources is None:
            return
        self._resources.close()

    def preload(self):
        """Preload the Container in the read mode."""
        self.db

    def tree(self) -> 'TreeView':
        """Return a :obj:`ContainerTreeView` which enables hierarchical view and access
        to the container records.

        This is achieved by prefixing groups and using `PATH_SENTINEL` as a
        separator for keys.

        For example, if the Container contents are:
            `{
                b'e.y': b'012',
                b'meta.x': b'123',
                b'meta.z': b'x',
                b'zzz': b'oOo'
            }`, and the path sentinel is `b'.'` then `tree = container.tree()`
            will behave as a (possibly deep) dict-like object:
            `tree[b'meta'][b'x'] == b'123'`
        """
        return ContainerTreeView(self)

    def get(
        self,
        key: ContainerKey,
        default=None
    ) -> ContainerValue:
        """Returns the value by the given `key` if it exists else `default`.

        The `default` is :obj:`None` by default.
        """
        try:
            return self[key]
        except KeyError:
            return default

    def __getitem__(
        self,
        key: ContainerKey
    ) -> ContainerValue:
        """Returns the value by the given `key`.

        Raises :obj:`KeyError` if the `key` is not found.
        """
        value = self.db.get(key=key)
        if value is None:
            raise KeyError(key)
        if value == BLOB_SENTINEL:
            return self._get_blob(key)
        return value

    def _get_blob_loader(
        self,
        key: ContainerKey
    ):
        def loader() -> bytes:
            data = self[BLOB_DOMAIN + key]
            assert isinstance(data, bytes)
            return data
        return loader

    def _get_blob(
        self,
        key: ContainerKey
    ) -> BLOB:
        return BLOB(loader_fn=self._get_blob_loader(key))

    def _put(
        self,
        key: ContainerKey,
        value: ContainerValue,
        *,
        target: aimrocks.WriteBatch
    ):
        target.put(key, value)

    def _put_blob(
        self,
        key: ContainerKey,
        value: BLOB,
        *,
        target: aimrocks.WriteBatch
    ):
        self._put(key=BLOB_DOMAIN + key,
                  value=bytes(value),
                  target=target)

    def _delete(
        self,
        key: ContainerKey,
        *,
        target: aimrocks.WriteBatch
    ):
        target.delete(key)

    def _delete_blob(
        self,
        key: ContainerKey,
        *,
        target: aimrocks.WriteBatch
    ):
        self._delete(key=BLOB_DOMAIN + key,
                     target=target)

    def _delete_range(
        self,
        begin: ContainerKey,
        end: ContainerKey,
        *,
        target: aimrocks.WriteBatch
    ):
        target.delete_range(begin, end)

    def _delete_blob_range(
        self,
        begin: ContainerKey,
        end: ContainerKey,
        *,
        target: aimrocks.WriteBatch
    ):
        self._delete_range(BLOB_DOMAIN + begin,
                           BLOB_DOMAIN + end,
                           target=target)

    def set(
        self,
        key: ContainerKey,
        value: ContainerValue,
        store_batch: aimrocks.WriteBatch = None
    ):
        """Set a value for given key, optionally store in a batch.

        If `store_batch` is provided, instead of the `(key, value)` being added
        to the collection immediately, the operation is stored in a batch in
        order to be executed in a whole with other write operations.

        See :obj:`RocksContainer.batch` and :obj:`RocksContainer.commit` for
        more details.
        """
        target = self.batch() if store_batch is None else store_batch

        if isinstance(value, BLOB):
            self._put(key=key, value=BLOB_SENTINEL, target=target)
            self._put_blob(key=key, value=value, target=target)
        else:
            self._put(key=key, value=value, target=target)
            self._delete_blob(key=key, target=target)

        if store_batch is None:
            self.commit(target)

    def __setitem__(
        self,
        key: ContainerKey,
        value: ContainerValue
    ):
        """Set a value for given key."""
        self.set(key=key, value=value)

    def delete(
        self,
        key: ContainerKey,
        *,
        store_batch: aimrocks.WriteBatch = None
    ):
        """Delete a key-value record by the given key,
        optionally store in a batch.

        If `store_batch` is provided, instead of the `(key, value)` being added
        to the collection immediately, the operation is stored in a batch in
        order to be executed in a whole with other write operations.

        See :obj:`RocksContainer.batch` and :obj:`RocksContainer.commit` for
        more details.
        """
        target = self.batch() if store_batch is None else store_batch

        self._delete(key, target=target)
        self._delete_blob(key, target=target)

        if store_batch is None:
            self.commit(target)

    def __delitem__(
        self,
        key: ContainerKey
    ) -> None:
        """Delete a key-value record by the given key."""
        self.delete(key)

    def delete_range(
        self,
        begin: ContainerKey,
        end: ContainerKey,
        store_batch: aimrocks.WriteBatch = None
    ):
        """Delete all the records in the given `[begin, end)` key range,
        optionally store in a batch.

        If `store_batch` is provided, instead of the `(key, value)` being added
        to the collection immediately, the operation is stored in a batch in
        order to be executed in a whole with other write operations.

        See :obj:`RocksContainer.batch` and :obj:`RocksContainer.commit` for
        more details.
        """
        target = self.batch() if store_batch is None else store_batch

        self._delete_range(begin, end, target=target)
        self._delete_blob_range(begin, end, target=target)

        if store_batch is None:
            self.commit(target)

    def items(
        self,
        prefix: ContainerKey = b''
    ) -> Iterator[Tuple[ContainerKey, ContainerValue]]:
        """Iterate over all the key-value records in the prefix key range.

        The iteration is always performed in lexiographic order w.r.t keys.
        If `prefix` is provided, iterate only over those records that have key
        starting with the `prefix`.

        For example, if `prefix == b'meta.'`, and the Container consists of:
        `{
            b'e.y': b'012',
            b'meta.x': b'123',
            b'meta.z': b'x',
            b'zzz': b'oOo'
        }`, the method will yield `(b'meta.x', b'123')` and `(b'meta.z', b'x')`

        Args:
            prefix (:obj:`bytes`): the prefix that defines the key range
        """
        return RocksContainerItemsIterator(container=self, prefix=prefix)

    def walk(
        self,
        prefix: ContainerKey = b''
    ):
        """A bi-directional generator to walk over the collection of records on
        any arbitrary order. The `prefix` sent to the generator (lets call it
        a `walker`) seeks for lower-bound key in the collection.

        In other words, if the Container contents are:
        `{
            b'e.y': b'012',
            b'meta.x': b'123',
            b'meta.z': b'x',
            b'zzz': b'oOo'
        }` and `walker = container.walk()` then:
        `walker.send(b'meta') == b'meta.x'`, `walker.send(b'e.y') == b'e.y'`
        """
        it = self.db.iteritems()
        it.seek(prefix)

        while True:
            try:
                key, val = next(it)
            except StopIteration:
                yield None
                break
            jump = yield key
            it.seek(jump)

    def view(
        self,
        prefix: ContainerKey = b''
    ) -> 'Container':
        """Return a view (even mutable ones) that enable access to the container
        but with modifications.

        Args:
            prefix (:obj:`bytes`): the prefix that defines the key range of the
                view-container. The resulting container will share an access to
                only records in the `prefix` key range, but with `prefix`-es
                stripped from them.

                For example, if the Container contents are:
                `{
                    b'e.y': b'012',
                    b'meta.x': b'123',
                    b'meta.z': b'x',
                    b'zzz': b'oOo'
                }`, then `container.view(prefix=b'meta.')` will behave (almost)
                exactly as an Container:
                `{
                    b'x': b'123',
                    b'z': b'x',
                }`
        """
        return PrefixView(prefix=prefix, container=self)

    def batch(
        self
    ) -> aimrocks.WriteBatch:
        """Creates a new batch object to store operations in before executing
        using :obj:`RocksContainer.commit`.

        The operations :obj:`RocksContainer.set`, :obj:`RocksContainer.delete`,
        :obj:`RocksContainer.delete_range` are supported.

        See more at :obj:`RocksContainer.commit`
        """
        return aimrocks.WriteBatch()

    def commit(
        self,
        batch: aimrocks.WriteBatch
    ):
        """Execute the accumulated write operations in the given `batch`.

        The `RocksContainer` features atomic writes for batches.
        """
        self.db.write(batch)

    def next_item(
        self,
        prefix: ContainerKey = b''
    ) -> Tuple[ContainerKey, ContainerValue]:
        """Returns `(key, value)` for the key that comes (lexicographically)
        right after the provided `key`.
        """
        it = self.db.iteritems()
        it.seek(prefix + b'\x00')

        key, value = next(it)

        if not key.startswith(prefix):
            raise KeyError

        if value == BLOB_SENTINEL:
            value = self._get_blob(key)

        return key, value

    def prev_item(
        self,
        prefix: ContainerKey = b''
    ) -> Tuple[ContainerKey, ContainerValue]:
        """Returns `(key, value)` for the key that comes (lexicographically)
        right before the provided `key`.
        """
        it = self.db.iteritems()
        it.seek_for_prev(prefix + b'\xff')

        key, value = it.get()

        if value == BLOB_SENTINEL:
            value = self._get_blob(key)

        return key, value

    def optimize_for_read(self):
        optimize_db_for_read(self.path, self._db_opts, run_compactions=self._extra_opts.get('compaction', False))


@exception_resistant(silent=True)
def optimize_db_for_read(path: Path, options: dict, run_compactions: bool = False):
    """
    This function will try to open rocksdb db in write mode and force WAL files recovery. Once done the underlying
    db will contain .sst files only which will significantly reduce further open and read operations. Further
    optimizations can be done by running compactions but this is a costly operation to be performed online.


    Args:
        path (:obj:`Path`): Path to rocksdb.
        options (:obj:`dict`): options to be passed to aimrocks.DB object __init__.
        run_compactions (:obj:`bool`, optional): Flag used to run rocksdb range compactions. False by default.
    """

    def non_empty_wal():
        for wal_path in path.glob('*.log'):
            if os.path.getsize(wal_path) > 0:
                return True
        return False

    if non_empty_wal():
        lock_path = prepare_lock_path(path)

        with SoftFileLock(lock_path, timeout=0):
            wdb = aimrocks.DB(str(path), aimrocks.Options(**options), read_only=False)
            wdb.flush()
            wdb.flush_wal()
            if run_compactions:
                wdb.compact_range()
            del wdb


def prepare_lock_path(path: Path):
    """
    This function creates the locks directory (if needed) and returns a LOCK file path for given rocksdb `path`.

    Args:
        path (:obj:`Path`): Path to rocksdb.

    Returns:
        path (:obj:`Path`) to lock file for given rocksdb.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    locks_dir = path.parent.parent / 'locks'
    locks_dir.mkdir(parents=True, exist_ok=True)
    return locks_dir / path.name


class RocksContainerItemsIterator(ContainerItemsIterator):
    def __init__(
        self,
        container: RocksContainer,
        prefix: ContainerKey = b''
    ):
        self.container = container
        self.prefix = prefix
        self.it = self.container.db.iteritems()
        self.it.seek(prefix)

    def next(self):
        item = self.it.next()

        if item is None:
            return None

        key = item[0]
        value = item[1]

        if not key.startswith(self.prefix):
            return None

        if value == BLOB_SENTINEL:
            return key, self.container._get_blob(key)

        return key, value
