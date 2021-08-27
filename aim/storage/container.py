import logging
from pathlib import Path
from filelock import FileLock

import aimrocks

from aim.storage import encoding as E

from typing import Iterator, Optional, Tuple, Union

from aim.storage.containerview import ContainerView
from aim.storage.prefixview import PrefixView
from aim.storage.treeview import TreeView


logger = logging.getLogger(__name__)


class Container(ContainerView):
    """
    Containers are sets of {key: values}.
    Ideally we want to query not separate Containers
    but Unions of Containers instead.

    Each Container corresponds to a single RocksDB database.

    Containers satisfy Dict properties per run.
    """
    def __init__(
        self,
        path: str,
        read_only: bool = False,
        wait_if_busy: bool = False
    ) -> None:
        self.path = Path(path)
        self.read_only = read_only
        self._db_opts = dict(
            create_if_missing=True,
            paranoid_checks=False,
            keep_log_file_num=10,
            skip_stats_update_on_db_open=True,
            skip_checking_sst_file_sizes_on_db_open=True,
            max_open_files=-1,
            write_buffer_size=64 * 1024 * 1024,  # 64MB
            max_write_buffer_number=3,
            target_file_size_base=64 * 1024 * 1024,  # 64MB
            max_background_compactions=4,
            level0_file_num_compaction_trigger=8,
            level0_slowdown_writes_trigger=17,
            level0_stop_writes_trigger=24,
            num_levels=4,
            max_bytes_for_level_base=512 * 1024 * 1024,  # 512MB
            max_bytes_for_level_multiplier=8,
        )
        # opts.allow_concurrent_memtable_write = False
        # opts.memtable_factory = aimrocks.VectorMemtableFactory()
        # opts.table_factory = aimrocks.PlainTableFactory()
        # opts.table_factory = aimrocks.BlockBasedTableFactory(block_cache=aimrocks.LRUCache(67108864))
        # opts.write_buffer_size = 67108864
        # opts.arena_block_size = 67108864

        self._db = None
        self._lock = None
        self._wait_if_busy = wait_if_busy  # TODO implement
        self._lock_path: Optional[Path] = None
        self._progress_path: Optional[Path] = None
        # TODO check if Containers are reopenable

    @property
    def db(self) -> aimrocks.DB:
        if self._db is not None:
            return self._db

        logger.debug(f'opening {self.path} as aimrocks db')
        self.path.parent.mkdir(parents=True, exist_ok=True)
        locks_dir = self.path.parent.parent / 'locks'
        locks_dir.mkdir(parents=True, exist_ok=True)

        if not self.read_only:
            self._lock_path = locks_dir / self.path.name
            self._lock = FileLock(str(self._lock_path), timeout=10)
            self._lock.acquire()

        self._db = aimrocks.DB(str(self.path),
                               aimrocks.Options(**self._db_opts),
                               read_only=self.read_only)

        return self._db

    @property
    def writable_db(self) -> aimrocks.DB:
        db = self.db
        if self._progress_path is None:
            progress_dir = self.path.parent.parent / 'progress'
            progress_dir.mkdir(parents=True, exist_ok=True)
            self._progress_path = progress_dir / self.path.name
            self._progress_path.touch(exist_ok=True)
        return db

    def finalize(self, *, index: ContainerView):
        if not self._progress_path:
            return

        for k, v in self.items():
            index[k] = v

        self._progress_path.unlink(missing_ok=False)
        self._progress_path = None

    def close(self):
        if self._lock is not None:
            self._lock.release()
            self._lock = None
        if self._db is not None:
            # self._db.close()
            self._db = None

    def __del__(self):
        self.close()

    def preload(self):
        self.db

    def tree(self) -> 'TreeView':
        return TreeView(self)

    def batch_set(
        self,
        key: bytes,
        value: bytes,
        *,
        store_batch: aimrocks.WriteBatch = None
    ):
        if store_batch is None:
            store_batch = self.writable_db
        store_batch.put(key=key, value=value)

    def __setitem__(
        self,
        key: bytes,
        value: bytes
    ):
        self.writable_db.put(key=key, value=value)

    def __getitem__(
        self,
        key: bytes
    ) -> bytes:
        return self.db.get(key=key)

    def __delitem__(
        self,
        key: bytes
    ) -> None:
        return self.writable_db.delete(key)

    def batch_delete(
        self,
        prefix: bytes,
        store_batch: aimrocks.WriteBatch = None
    ):
        if store_batch is None:
            batch = aimrocks.WriteBatch()
        else:
            batch = store_batch

        batch.delete_range((prefix, prefix + b'\xff'))

        if not store_batch:
            self.writable_db.write(batch)
        else:
            return batch

    def items(
        self,
        prefix: bytes = b''
    ) -> Iterator[Tuple[bytes, bytes]]:
        # TODO return ValuesView, not iterator
        it: Iterator[Tuple[bytes, bytes]] = self.db.iteritems()
        it.seek(prefix)
        for key, val in it:
            if not key.startswith(prefix):
                break
            yield key, val

    def walk(
        self,
        prefix: bytes = b''
    ):
        it: Iterator[Tuple[bytes, bytes]] = self.db.iteritems()
        it.seek(prefix)

        while True:
            try:
                key, val = next(it)
            except StopIteration:
                yield None
                break
            jump = yield key
            it.seek(jump)

    def iterlevel(
        self,
        prefix: bytes = b''
    ) -> Iterator[Tuple[bytes, bytes]]:
        # TODO return ValuesView, not iterator
        # TODO broken right now
        it: Iterator[Tuple[bytes, bytes]] = self.db.iteritems()
        it.seek(prefix)

        key, val = next(it)

        while True:
            try:
                key, val = next(it)
            except StopIteration:
                break

            if not key.startswith(prefix):
                break

            next_range = key[:-1] + bytes([key[-1] + 1])
            it.seek(next_range)

            yield key, val

    def keys(
        self,
        prefix: bytes = b''
    ):
        # TODO return KeyView, not iterator
        it: Iterator[Tuple[bytes, bytes]] = self.db.iterkeys()
        it.seek(prefix)
        for key in it:
            if not key.startswith(prefix):
                break
            yield key

    def values(
        self,
        prefix: bytes
    ):
        # not vraz thing to implement
        raise NotImplementedError

    def update(
        self
    ) -> None:
        raise NotImplementedError

    def view(
        self,
        prefix: Union[
            bytes,
            Tuple[Union[int, str], ...]
        ]
    ) -> 'ContainerView':
        if not isinstance(prefix, bytes):
            prefix = E.encode_path(prefix)
        return PrefixView(prefix=prefix, container=self)

    def commit(
        self,
        batch: aimrocks.WriteBatch
    ):
        self.writable_db.write(batch)

    def next_key(
        self,
        prefix: bytes = b''
    ) -> bytes:
        it: Iterator[bytes] = self.db.iterkeys()
        it.seek(prefix + b'\x00')
        key = next(it)

        if not key.startswith(prefix):
            raise KeyError

        return key

    def next_value(
        self,
        prefix: bytes = b''
    ) -> bytes:
        key, value = self.next_key_value(prefix)
        return value

    def next_key_value(
        self,
        prefix: bytes = b''
    ) -> Tuple[bytes, bytes]:
        it: Iterator[Tuple[bytes, bytes]] = self.db.iteritems()
        it.seek(prefix + b'\x00')

        key, value = next(it)

        if not key.startswith(prefix):
            raise KeyError

        return key, value

    def prev_key(
        self,
        prefix: bytes = b''
    ) -> bytes:
        key, value = self.prev_key_value(prefix)
        return key

    def prev_value(
        self,
        prefix: bytes = b''
    ) -> bytes:
        key, value = self.prev_key_value(prefix)
        return value

    def prev_key_value(
        self,
        prefix: bytes
    ) -> Tuple[bytes, bytes]:
        it: Iterator[Tuple[bytes, bytes]] = self.db.iteritems()
        it.seek_for_prev(prefix + b'\xff')

        key, value = it.get()

        return key, value
