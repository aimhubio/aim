import heapq
import logging
import os
import aimrocks
from pathlib import Path

from aim.storage.encoding import encode_path
from aim.storage.container import Container

from typing import Dict, List, NamedTuple, Tuple


logger = logging.getLogger(__name__)


class Racer(NamedTuple):
    key: bytes
    priority: int
    value: bytes
    prefix: bytes
    iterator: 'aimrocks.ItemsIterator'


class ItemsIterator:
    def __init__(self, iterators: Dict[bytes, "aimrocks.ItemsIterator"]):
        self._iterators = iterators
        self._priority: Dict[bytes, int] = {
            prefix: idx
            for idx, prefix in enumerate(iterators)
        }
        self._heap: List[Racer] = []

    def __iter__(self):
        return self

    def __reversed__(self):
        raise NotImplementedError

    def seek_to_first(self):
        for prefix, iterator in self._iterators.items():
            iterator.seek_to_first()
        self._init_heap()

    def seek_to_last(self):
        for prefix, iterator in self._iterators.items():
            iterator.seek_to_last()
        self._init_heap()

    def seek(self, key: bytes):
        for prefix, iterator in self._iterators.items():
            iterator.seek(key)
        self._init_heap()

    def seek_for_prev(self, key):
        for prefix, iterator in self._iterators.items():
            iterator.seek_for_prev(key)
        max_key = self._init_heap()
        self.seek(max_key)

    def get(self) -> Tuple[bytes, bytes]:
        return self._get(seek_next=False)

    def _get(self, seek_next: bool = False) -> Tuple[bytes, bytes]:

        if not self._heap:
            raise StopIteration

        key, _, value, prefix, iterator = self._heap[0]

        if not seek_next:
            return key, value

        while self._heap:
            alt = self._heap[0]

            if (
                alt.key != key and
                (alt.prefix == prefix or not alt.key.startswith(prefix))
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


    def _init_heap(self
                   ):
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

    def __next__(self) -> Tuple[bytes, bytes]:
        return self._get(seek_next=True)


# We temporary implement KeysIterator and ValuesIterator
# using ItemsIterator because the performance is not better
# when iterating over only one of them

class KeysIterator(ItemsIterator):

    def get(self) -> bytes:
        key, value = super().get()
        return key

    def __next__(self) ->  bytes:
        key, value = super().__next__()
        return key


class ValuesIterator(ItemsIterator):

    def get(self) -> bytes:
        key, value = super().get()
        return value

    def __next__(self) ->  bytes:
        key, value = super().__next__()
        return value


class DB(object):
    def __init__(self, db_path: str, db_name: str, opts, read_only: bool = False):
        self.db_path = db_path
        self.db_name = db_name
        self.paths: List[str]
        self.dbs: List[aimrocks.DB]
        self.opts = opts
        self._get_dbs()

    def _get_dbs(self):
        self.paths: Dict[str, str] = dict()

        try:
            index_db = aimrocks.DB(os.path.join(self.db_path, self.db_name, 'index'),
                                   opts=aimrocks.Options(**self.opts),
                                   read_only=True)
        except Exception as e:
            index_db = None
            logger.warning('No index was detected')

        # If index exists -- only load those in progress
        selector = 'progress' if index_db is not None else 'chunks'

        self.paths.update({
            prefix: os.path.join(self.db_path, self.db_name, 'chunks', prefix)
            for prefix in
            os.listdir(os.path.join(self.db_path, self.db_name, selector))
        })

        self.dbs: Dict[bytes, aimrocks.DB] = {
            encode_path((self.db_name, prefix)):
                aimrocks.DB(path, opts=aimrocks.Options(**self.opts), read_only=True)
            for prefix, path in self.paths.items()
        }
        if index_db is not None:
            self.dbs[encode_path((self.db_name,))] = index_db
        # print(self.dbs)
        return self.dbs

    def close(self):
        ...

    def get(self, key: bytes, *args, **kwargs) -> bytes:
        for prefix, db in self.dbs.items():
            # Shadowing
            if key.startswith(prefix):
                return db.get(key)
        raise ValueError

    def iteritems(
        self
    ) -> "ItemsIterator":
        return ItemsIterator({
            prefix: db.iteritems()
            for prefix, db
            in self.dbs.items()
        })

    def iterkeys(
        self
    ) -> "KeysIterator":
        return KeysIterator({
            prefix: db.iteritems()
            for prefix, db
            in self.dbs.items()
        })

    def itervalues(
        self
    ) -> "ValuesIterator":
        return ValuesIterator({
            prefix: db.iteritems()
            for prefix, db
            in self.dbs.items()
        })


class UnionContainer(Container):

    @property
    def db(self) -> aimrocks.DB:
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
