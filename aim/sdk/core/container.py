import logging

from collections import defaultdict
from typing import Optional, Type, Union, Dict, Callable, Iterator, Tuple, Any

from aim.sdk.core.interfaces.container import (
    Container as ABCContainer
)
from aim.sdk.core.sequence import Sequence
from aim.sdk.core.interfaces.sequence import SequenceMap

from aim.sdk.core import type_utils
from aim.sdk.core.utils import generate_hash, utc_timestamp
from aim.sdk.core.constants import ContainerOpenMode, KeyNames
from aim.sdk.core.exceptions import MissingContainerError

from aim.ext.cleanup import AutoClean

from aim.storage.types import SafeNone
from aim.storage.hashing import hash_auto
from aim.storage.query import RestrictedPythonQuery
from aim.storage.context import Context


from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from aim.storage.treeview import TreeView
    from aim.sdk.core.repo import Repo


logger = logging.getLogger(__name__)


class ContainerAutoClean(AutoClean['Container']):
    PRIORITY = 90

    def __init__(self, instance: 'Container') -> None:
        super().__init__(instance)

        self.mode = instance.mode
        self.hash = instance.hash

        self._tree = instance._tree
        self.storage = instance.storage

        self._status_reporter = instance._status_reporter
        self._heartbeat = instance._heartbeat
        self._lock = instance._lock

    def _set_end_time(self):
        """
        Finalize the run by indexing all the data.
        """
        self._tree[KeyNames.INFO_PREFIX, 'end_time'] = utc_timestamp()

    def _wait_for_empty_queue(self):
        queue = self.storage.task_queue(self.hash)
        if queue:
            queue.wait_for_finish()

    def _stop_queue(self):
        queue = self.storage.task_queue(self.hash)
        if queue:
            queue.stop()
            self.storage.remove_queue(self.hash)

    def _close(self) -> None:
        """
        Close the `Run` instance resources and trigger indexing.
        """
        if self.mode == ContainerOpenMode.READONLY:
            logger.debug(f'Run {self.hash} is read-only, skipping cleanup')
            return

        self._wait_for_empty_queue()
        self._set_end_time()
        if self._heartbeat is not None:
            self._heartbeat.stop()
        if self._status_reporter is not None:
            self._status_reporter.close()
        if self._lock:
            self._lock.release()
        self._stop_queue()


@type_utils.query_alias('container', 'c')
@type_utils.auto_registry
class Container(ABCContainer):
    default_aliases = set()
    version = '1.0.0'

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        typename = cls.get_typename()
        if typename is not None:  # check for intermediate helper classes
            cls.registry[typename] = cls

    def __init__(self, hash_: Optional[int] = None, /, *,
                 repo: Optional[Union[str, 'Repo']] = None,
                 mode: Optional[Union[str, ContainerOpenMode]] = ContainerOpenMode.WRITE):
        if isinstance(mode, str):
            mode = ContainerOpenMode[mode]
        self.mode = mode

        if repo is None:
            from aim.sdk.core.repo import Repo
            repo = Repo.default_repo()
        elif isinstance(repo, str):
            from aim.sdk.core.repo import Repo
            repo = Repo.from_path(repo)
        self.storage = repo.storage_engine

        if hash_ is None:
            if not self._is_readonly:
                self.hash = generate_hash()
            else:
                raise MissingContainerError(hash_, mode)
        else:
            if hash_ in self.storage.container_hashes():
                self.hash = hash_
            else:
                raise MissingContainerError(hash_, mode)

        self._resources: Optional[ContainerAutoClean] = None
        self._hash = self._calc_hash()
        self._lock = None
        self._status_reporter = None
        self._heartbeat = None

        if not self._is_readonly:
            self._lock = self.storage.lock(self.hash, self.mode)
            self._status_reporter = self.storage.status_reporter(self.hash)
            self._heartbeat = self.storage.heartbeat_reporter(self.hash, self._status_reporter)

        self._meta_tree: TreeView = self.storage.tree('meta', self.hash, read_only=self._is_readonly)
        self._tree: TreeView = self._meta_tree.subtree('chunks').subtree(self.hash)
        self._meta_attrs_tree: TreeView = self._meta_tree.subtree('attrs')
        self._attrs_tree: TreeView = self._tree.subtree('attrs')

        if not self._is_readonly:
            if hash_ is None:  # newly create Container
                container_type = self.get_full_typename()
                self._tree[KeyNames.INFO_PREFIX, 'creation_time'] = utc_timestamp()
                self._tree[KeyNames.INFO_PREFIX, 'version'] = self.version
                self._tree[KeyNames.INFO_PREFIX, KeyNames.CONTAINER_TYPE] = container_type
                self._meta_tree[KeyNames.CONTAINER_TYPES, self.hash] = container_type
                self[...] = {}

            self._tree[KeyNames.INFO_PREFIX, 'end_time'] = None

        self._data_loader: Callable[[], 'TreeView'] = lambda: self._sequence_data_tree
        self.__sequence_data_tree: TreeView = None
        self._sequence_map = ContainerSequenceMap(self, Sequence)
        self._resources = ContainerAutoClean(self)

    @property
    def _is_readonly(self) -> bool:
        return self.mode == ContainerOpenMode.READONLY

    @property
    def _sequence_data_tree(self) -> 'TreeView':
        if self.__sequence_data_tree is None:
            self.__sequence_data_tree = self.storage.tree('seqs', self.hash, read_only=self._is_readonly)
        return self.__sequence_data_tree

    def __setitem__(self, key, value):
        self._attrs_tree[key] = value
        self._meta_attrs_tree[key] = value

    def __getitem__(self, key):
        return self._attrs_tree.collect(key, strict=True)

    def __delitem__(self, key):
        del self._attrs_tree[key]
        del self._meta_attrs_tree[key]

    def get(self, key, default: Any = None, strict: bool = False):
        try:
            return self._attrs_tree.collect(key, strict=strict)
        except KeyError:
            return default

    def match(self, expr) -> bool:
        query = RestrictedPythonQuery(expr)
        query_cache = defaultdict(dict)
        return self._check(query, query_cache)

    class QueryProxy:
        def __init__(self, cont_obj: 'Container', cache: Dict):
            self._cache = cache[cont_obj.hash]
            self._cont_obj = cont_obj

        def __getattr__(self, item):
            return self[item]  # fallback to __getitem__

        def __getitem__(self, item):
            from aim.storage.proxy import AimObjectProxy

            def _collect():
                if item not in self._cache:
                    try:
                        res = self._cont_obj._attrs_tree.collect(item)
                    except Exception:
                        res = SafeNone()
                    self._cache[item] = res
                else:
                    return self._cache[item]

            return AimObjectProxy(_collect, view=self._cont_obj._attrs_tree.subtree(item), cache=self._cache)

    def _proxy(self, query_cache) -> QueryProxy:
        return Container.QueryProxy(self, query_cache)

    def _check(self, query, query_cache, *, aliases=()) -> bool:
        proxy = self._proxy(query_cache)

        if isinstance(aliases, str):
            aliases = (aliases,)
        alias_names = self.default_aliases.union(aliases)
        query_params = {p: proxy for p in alias_names}
        return query.check(**query_params)

    @property
    def sequences(self) -> 'SequenceMap':
        return self._sequence_map

    def __repr__(self) -> str:
        return f'<{self.get_typename()} #{hash(self)} hash={self.hash} mode={self.mode}>'

    def __hash__(self) -> int:
        return self._hash

    def _calc_hash(self):
        return hash_auto((self.hash, hash(self.storage.url), str(self.mode)))


class ContainerSequenceMap(SequenceMap[Sequence]):
    def __init__(self, container: Container, sequence_cls: Type[Sequence]):
        self._container: Container = container
        self._sequence_cls: Type[Sequence] = sequence_cls
        self._sequence_tree: 'TreeView' = container._tree.subtree(KeyNames.SEQUENCES)
        self._data_loader: Callable[[], 'TreeView'] = container._data_loader

    def __call__(self,
                 query_: Optional[str] = None,
                 type_: Union[str, Type[Sequence]] = Sequence, /,
                 **kwargs) -> 'SequenceCollection':

        context = {
            'storage': self._container.storage,
            KeyNames.ALLOWED_VALUE_TYPES: type_utils.get_sequence_value_types(type_),
            KeyNames.SEQUENCE_TYPE: type_,
            'mode': 'READONLY'
        }

        import json
        import itertools
        from aim.sdk.core.collections import ContainerSequenceCollection

        query_exprs = (f'(container.{var_} == {json.dumps(value)})' for var_, value in kwargs.items())
        if query_ is not None:
            q = ' and '.join(itertools.chain((query_,), query_exprs))
        else:
            q = ' and '.join(query_exprs)
        seq_collection = ContainerSequenceCollection(self._container, context)
        return seq_collection.filter(q) if q else seq_collection

    def __iter__(self) -> Iterator[Sequence]:
        for context_idx in self._sequence_tree.keys():
            context = self._container._meta_tree[KeyNames.CONTEXTS, context_idx]
            for name in self._sequence_tree.subtree(context_idx).keys():
                yield self._sequence_cls(self._container, name=name, context=context)

    def __getitem__(self, item: Union[str, Tuple[str, Dict]]) -> Sequence:
        if isinstance(item, str):
            name = item
            context = {}
        else:
            assert isinstance(item, tuple)
            name = item[0]
            context = {} if item[1] is None else item[1]

        context_idx = Context(context).idx
        try:
            self._sequence_tree.subtree((context_idx, name)).last_key()
            exists = True
        except KeyError:
            exists = False

        if self._container._is_readonly and not exists:
            raise ValueError('Cannot create sequence from a readonly container.')

        return self._sequence_cls(self._container, name=name, context=context)

    def __delitem__(self, item: Union[str, Tuple[str, Dict]]):
        if self._container._is_readonly:
            raise ValueError('Cannot delete sequence from a readonly container.')

        if isinstance(item, str):
            name = item
            context = {}
        else:
            assert isinstance(item, tuple)
            name = item[0]
            context = {} if item[1] is None else item[1]

        context_idx = Context(context).idx
        del self._sequence_tree[context_idx, name]
        data_tree = self._data_loader()
        del data_tree[context_idx, name]
