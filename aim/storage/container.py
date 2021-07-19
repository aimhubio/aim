from pathlib import Path

from abc import abstractmethod
import aimrocks

from aim.storage import encoding as E

from typing import Any, Iterable, Iterator, MutableMapping, Tuple, Union

from aim.storage.treeview import TreeView
# run1.meta.db
# run1.series.db
from aim.storage.containerview import ContainerView
from aim.storage.singlecontainerview import SingleContainerView


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
        read_only: bool = False
    ) -> None:
        self.path = path
        self.read_only = read_only
        # TODO implement column families
        self._db_opts = aimrocks.Options(create_if_missing=True)
        # opts.allow_concurrent_memtable_write = False
        # opts.memtable_factory = aimrocks.VectorMemtableFactory()
        # opts.table_factory = aimrocks.PlainTableFactory()
        # opts.table_factory = aimrocks.BlockBasedTableFactory(block_cache=aimrocks.LRUCache(67108864))
        # opts.write_buffer_size = 67108864
        # opts.arena_block_size = 67108864

        self._db = None

    @property
    def db(self):
        if self._db is not None:
            return self._db
        try:
            self._db = aimrocks.DB(self.path, self._db_opts, read_only=self.read_only)
        except Exception as e:
            print(self.path)
            pass

        if not self.read_only:
            self.progress_path = Path(f'{self.path.replace("runs", "progress")}.progress')
            self.progress_path.touch(exist_ok=True)
            self.mutex = None  # TODO create a mutex and lock some ops
        return self._db

    def batch_set(
        self,
        key: bytes,
        value: bytes,
        *,
        store_batch: aimrocks.WriteBatch = None
    ):
        if store_batch is None:
            store_batch = self.db
        store_batch.put(key=key, value=value)

    def __setitem__(
        self,
        key: bytes,
        value: bytes
    ):
        self.db.put(key=key, value=value)

    def __getitem__(
        self,
        key: bytes
    ) -> bytes:
        return self.db.get(key=key)

    def __delitem__(
        self,
        key: bytes
    ) -> None:
        return self.db.delete(key)

    def batch_delete(
        self,
        prefix: bytes,
        store_batch: aimrocks.WriteBatch = None
    ):
        if store_batch is None:
            batch = aimrocks.WriteBatch()
        else:
            batch = store_batch

        for key in self.keys(prefix=prefix):
            batch.delete(key)

        if not store_batch:
            self.db.write(batch)
        else:
            return batch

    def items(
        self,
        prefix: bytes = None
    ) -> Iterator[Tuple[bytes, bytes]]:
        # TODO return ValuesView, not iterator
        it: Iterator[Tuple[bytes, bytes]] = self.db.iteritems()
        if prefix is not None:
            it.seek(prefix)
        else:
            it.seek_to_first()
        for key, val in it:
            if prefix is not None and not key.startswith(prefix):
                break
            yield key, val

    def walk(
        self,
        prefix: bytes = None
    ):
        it: Iterator[Tuple[bytes, bytes]] = self.db.iteritems()
        if prefix is not None:
            it.seek(prefix)
        else:
            it.seek_to_first()

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
        prefix: bytes = None
    ) -> Iterator[Tuple[bytes, bytes]]:
        # TODO return ValuesView, not iterator
        # TODO broken right now
        it: Iterator[Tuple[bytes, bytes]] = self.db.iteritems()
        if prefix is not None:
            it.seek(prefix)
        else:
            it.seek_to_first()

        key, val = next(it)

        while True:
            try:
                key, val = next(it)
            except StopIteration:
                break

            if prefix is not None and not key.startswith(prefix):
                break

            next_range = key[:-1] + bytes([key[-1] + 1])
            it.seek(next_range)

            yield key, val

    def keys(
        self,
        prefix: bytes = None
    ):
        # TODO return KeyView, not iterator
        it: Iterator[Tuple[bytes, bytes]] = self.db.iterkeys()
        if prefix is not None:
            it.seek(prefix)
        else:
            it.seek_to_first()
        for key in it:
            if prefix is not None and not key.startswith(prefix):
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
        return SingleContainerView(prefix=prefix, container=self)

    def commit(
        self,
        batch: aimrocks.WriteBatch
    ):
        self.db.write(batch)
