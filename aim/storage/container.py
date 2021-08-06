import logging
from pathlib import Path

import aimrocks

from aim.storage import encoding as E

from typing import Iterator, Tuple, Union

from aim.storage.containerview import ContainerView
from aim.storage.singlecontainerview import SingleContainerView


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
        read_only: bool = False
    ) -> None:
        self.path = path
        self.read_only = read_only
        self._db_opts = dict(
            create_if_missing=True,
            paranoid_checks=False
        )
        # opts.allow_concurrent_memtable_write = False
        # opts.memtable_factory = aimrocks.VectorMemtableFactory()
        # opts.table_factory = aimrocks.PlainTableFactory()
        # opts.table_factory = aimrocks.BlockBasedTableFactory(block_cache=aimrocks.LRUCache(67108864))
        # opts.write_buffer_size = 67108864
        # opts.arena_block_size = 67108864

        self._db = None

    @property
    def db(self) -> aimrocks.DB:
        if self._db is not None:
            return self._db

        logger.debug(f'opening {self.path} as aimrocks db')
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        self._db = aimrocks.DB(self.path, aimrocks.Options(**self._db_opts), read_only=self.read_only)

        # TODO acquire locks
        return self._db

    def preload(self):
        self.db

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

        batch.delete_range((prefix, prefix + b'\xff'))

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

    def next_key(
        self,
        prefix: bytes = b''
    ) -> bytes:
        it: Iterator[bytes] = self.db.iterkeys()
        if prefix is not None:
            it.seek(prefix + b'\x00')
        else:
            it.seek_to_first()

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
        if prefix is not None:
            it.seek(prefix + b'\x00')
        else:
            it.seek_to_first()

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
        prefix: bytes = b''
    ) -> Tuple[bytes, bytes]:
        it: Iterator[Tuple[bytes, bytes]] = self.db.iteritems()
        if prefix is not None:
            it.seek_for_prev(prefix + b'\xff')
        else:
            it.seek_to_last()

        key, value = it.get()

        return key, value
