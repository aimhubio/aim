import heapq
import logging
import os
import shutil

import aimrocks

import cachetools.func

from pathlib import Path

from aim.storage.encoding import encode_path
from aim.storage.container import Container, ContainerItemsIterator
from aim.storage.prefixview import PrefixView
from aim.storage.rockscontainer import RocksContainer, optimize_db_for_read

from typing import Dict, List, NamedTuple, Tuple, Set


logger = logging.getLogger(__name__)


class Racer(NamedTuple):
    key: bytes
    priority: int
    value: bytes
    prefix: bytes
    iterator: 'aimrocks.ItemsIterator'


class ItemsIterator(ContainerItemsIterator):
    def __init__(self, dbs: Dict[bytes, "aimrocks.DB"], corrupted_dbs: Set[bytes], *args, **kwargs):
        self.args = args
        self.kwargs = kwargs
        self._iterators = {}
        self._corrupted_dbs = corrupted_dbs
        for key, value in dbs.items():
            self._iterators[key] = value.iteritems(*args, **kwargs)
        self._priority: Dict[bytes, int] = {
            prefix: idx
            for idx, prefix in enumerate(self._iterators)
        }
        self._heap: List[Racer] = []

    def __iter__(self):
        return self

    def __reversed__(self):
        raise NotImplementedError

    def seek_to_first(self):
        corrupted_dbs = set()
        for prefix, iterator in self._iterators.items():
            try:
                iterator.seek_to_first()
            except (aimrocks.errors.RocksIOError, aimrocks.errors.Corruption):
                logger.debug(f'Detected corrupted db chunk \'{prefix}\'.')
                corrupted_dbs.add(prefix)
        self._corrupted_dbs.update(corrupted_dbs)
        for prefix in corrupted_dbs:
            del self._iterators[prefix]
            del self._priority[prefix]
        self._init_heap()

    def seek_to_last(self):
        corrupted_dbs = set()
        for prefix, iterator in self._iterators.items():
            try:
                iterator.seek_to_last()
            except (aimrocks.errors.RocksIOError, aimrocks.errors.Corruption):
                logger.debug(f'Detected corrupted db chunk \'{prefix}\'.')
                corrupted_dbs.add(prefix)
        self._corrupted_dbs.update(corrupted_dbs)
        for prefix in corrupted_dbs:
            del self._iterators[prefix]
            del self._priority[prefix]
        self._init_heap()

    def seek(self, key: bytes):
        corrupted_dbs = set()
        for prefix, iterator in self._iterators.items():
            try:
                iterator.seek(key)
            except (aimrocks.errors.RocksIOError, aimrocks.errors.Corruption):
                logger.debug(f'Detected corrupted db chunk \'{prefix}\'.')
                corrupted_dbs.add(prefix)
        self._corrupted_dbs.update(corrupted_dbs)
        for prefix in corrupted_dbs:
            del self._iterators[prefix]
            del self._priority[prefix]
        self._init_heap()

    def seek_for_prev(self, key):
        corrupted_dbs = set()
        for prefix, iterator in self._iterators.items():
            try:
                iterator.seek_for_prev(key)
            except (aimrocks.errors.RocksIOError, aimrocks.errors.Corruption):
                logger.debug(f'Detected corrupted db chunk \'{prefix}\'.')
                corrupted_dbs.add(prefix)
        self._corrupted_dbs.update(corrupted_dbs)
        for prefix in corrupted_dbs:
            del self._iterators[prefix]
            del self._priority[prefix]
        max_key = self._init_heap()
        self.seek(max_key)

    def get(self) -> Tuple[bytes, bytes]:
        item = self._get(seek_next=False)
        if item is None:
            raise ValueError()
        return item

    def _get(self, seek_next: bool = False) -> Tuple[bytes, bytes]:

        if not self._heap:
            return None

        key, _, value, prefix, iterator = self._heap[0]

        if not seek_next:
            return key, value

        while self._heap:
            alt = self._heap[0]

            if (
                alt.key != key and (alt.prefix == prefix or not alt.key.startswith(prefix))
            ):
                break

            heapq.heappop(self._heap)
            try:
                new_key, new_value = next(alt.iterator)
                racer = Racer(new_key, alt.priority, new_value, alt.prefix, alt.iterator)
                heapq.heappush(self._heap, racer)
                # self._state[prefix] = (new_key, new_value)
            except StopIteration:
                pass

        return key, value

    def _init_heap(self):
        self._heap = []
        max_key = b''
        for prefix, iterator in self._iterators.items():
            try:
                key, value = iterator.get()
                max_key = max(key, max_key)
            except ValueError:
                continue
            racer = Racer(key, self._priority[prefix], value, prefix, iterator)
            heapq.heappush(self._heap, racer)

        return max_key

    def next(self) -> Tuple[bytes, bytes]:
        return self._get(seek_next=True)


# We temporary implement KeysIterator and ValuesIterator
# using ItemsIterator because the performance is not better
# when iterating over only one of them

class KeysIterator(ItemsIterator):

    def get(self) -> bytes:
        key, value = super().get()
        return key

    def __next__(self) -> bytes:
        key, value = super().__next__()
        return key


class ValuesIterator(ItemsIterator):
    def get(self) -> bytes:
        key, value = super().get()
        return value

    def __next__(self) -> bytes:
        key, value = super().__next__()
        return value


class DB(object):
    _corruption_warned = False

    def __init__(self, db_path: str, db_name: str, opts, read_only: bool = False):
        assert read_only
        self.db_path = db_path
        self.db_name = db_name
        self.opts = opts
        self._dbs: Dict[bytes, aimrocks.DB] = dict()
        self._corrupted_dbs: Set[bytes] = set()

    def _get_db(
        self,
        prefix: bytes,
        path: str,
        cache: Dict[bytes, aimrocks.DB],
        store: Dict[bytes, aimrocks.DB] = None,
    ):
        db = cache.get(prefix)
        if db is None:
            optimize_db_for_read(Path(path), self.opts)
            db = aimrocks.DB(path, opts=aimrocks.Options(**self.opts), read_only=True)
        if store is not None:
            store[prefix] = db
        return db

    @cachetools.func.ttl_cache(maxsize=None, ttl=0.1)
    def _list_dir(self, path: str):
        try:
            return os.listdir(path)
        except FileNotFoundError:
            return []

    @property
    @cachetools.func.ttl_cache(maxsize=None, ttl=0.1)
    def dbs(self):
        index_prefix = encode_path((self.db_name, "chunks"))
        index_path = os.path.join(self.db_path, self.db_name, "index")
        try:
            index_db = self._get_db(index_prefix, index_path, self._dbs)
            # do a random read to check if index db is corrupted or not
            index_db.get(index_prefix)
        except (aimrocks.errors.RocksIOError, aimrocks.errors.Corruption):
            # delete index db and mark as corrupted
            corruption_marker = Path(index_path) / '.corrupted'
            if not corruption_marker.exists():
                # discard the case when index db does not exist
                rocks_current_path = Path(index_path) / 'CURRENT'
                if rocks_current_path.exists():
                    logger.warning('Corrupted index db. Deleting the index db to avoid errors. '
                                   'Please run `aim storage reindex command to restore optimal performance.`')
                    shutil.rmtree(index_path)
                    Path(index_path).mkdir()
                    corruption_marker.touch()
            index_db = None
        except Exception:
            index_db = None
            logger.info('No index was detected')

        # If index exists -- only load those in progress
        selector = 'progress' if index_db is not None else 'chunks'

        new_dbs: Dict[bytes, aimrocks.DB] = {}
        db_dir = os.path.join(self.db_path, self.db_name, selector)
        for prefix in self._list_dir(db_dir):
            path = os.path.join(self.db_path, self.db_name, "chunks", prefix)
            prefix = encode_path((self.db_name, "chunks", prefix))
            try:
                self._get_db(prefix, path, self._dbs, new_dbs)
            except (aimrocks.errors.RocksIOError, aimrocks.errors.Corruption):
                logger.debug(f'Detected corrupted db chunk \'{prefix}\'.')
                self._corrupted_dbs.add(prefix)

        if index_db is not None:
            new_dbs[b""] = index_db
        self._dbs = new_dbs
        return new_dbs

    def close(self):
        ...

    def get(self, key: bytes, *args, **kwargs) -> bytes:
        for prefix, db in self.dbs.items():
            # Shadowing
            if key.startswith(prefix):
                return db.get(key)
        return self.dbs[b""].get(key)

    def iteritems(
        self, *args, **kwargs
    ) -> "ItemsIterator":
        return ItemsIterator(self.dbs, self._corrupted_dbs, *args, **kwargs)

    def iterkeys(
        self, *args, **kwargs
    ) -> "KeysIterator":
        return KeysIterator(self.dbs, self._corrupted_dbs, *args, **kwargs)

    def itervalues(
        self, *args, **kwargs
    ) -> "ValuesIterator":
        return ValuesIterator(self.dbs, self._corrupted_dbs, *args, **kwargs)


class RocksUnionContainer(RocksContainer):

    def __init__(self, *args, **kwargs):
        return super().__init__(*args, **kwargs)

    @property
    def db(self) -> aimrocks.DB:
        assert self.read_only

        if self._db is not None:
            return self._db
        try:
            logger.debug(f'opening {self.path} as aimrocks db')
            path = Path(self.path)
            path.parent.mkdir(parents=True, exist_ok=True)

            self._db = DB(str(path.parent), path.name, self._db_opts, read_only=self.read_only)
        except Exception as e:
            # print(e, self.path)
            raise e

        return self._db

    @property
    def corrupted_dbs(self) -> Set[bytes]:
        # trigger db corruption checks
        self.db.iteritems().seek_to_first()
        return self.db._corrupted_dbs

    def view(
        self,
        prefix: bytes = b''
    ) -> 'Container':
        container = self
        if prefix and prefix in self.db.dbs:
            container = RocksUnionSubContainer(container=self, domain=prefix)
        return PrefixView(prefix=prefix,
                          container=container)


class RocksUnionSubContainer(RocksContainer):
    def __init__(self, container: 'RocksUnionContainer', domain: bytes):
        self._parent = container
        self.domain = domain

    @property
    def db(self) -> aimrocks.DB:
        db: DB = self._parent.db
        return db.dbs.get(self.domain, db)

    def view(
        self,
        prefix: bytes = b''
    ) -> 'Container':
        return PrefixView(prefix=prefix, container=self)
