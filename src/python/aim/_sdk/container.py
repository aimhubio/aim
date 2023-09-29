"""
The container module provides implementation of a Container class. Container is a core class, representing a inter-related
set of properties, parameters, Sequence and Record entities. Specific Container types can be used to collect and store
data representing a process execution, such as model training, LLM chain execution, etc.
Container class provides interface for getting and setting it's pre-defined Properties as well as free-form dict-like parameters.
Container class has an interface for managing sequence objects.
"""

import logging
import cachetools.func

from collections import defaultdict
from typing import Optional, Type, Union, Dict, Callable, Iterator, Tuple, Any

from aim._sdk.interfaces.container import (
    Container as ABCContainer
)
from aim._sdk.sequence import Sequence
from aim._sdk.interfaces.sequence import SequenceMap, SequenceCollection

from aim._sdk import type_utils
from aim._sdk.utils import generate_hash, utc_timestamp
from aim._sdk.query_utils import ContainerQueryProxy, construct_query_expression
from aim._sdk.collections import ContainerSequenceCollection
from aim._sdk.constants import ContainerOpenMode, KeyNames
from aim._sdk.exceptions import MissingContainerError

from aimcore.cleanup import AutoClean

from aim._core.storage.hashing import hash_auto
from aim._sdk.query import RestrictedPythonQuery
from aim._sdk.context import Context


from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from aim._core.storage.treeview import TreeView
    from aim._sdk.repo import Repo
    from aim._sdk.collections import ContainerCollection

logger = logging.getLogger(__name__)


class ContainerAutoClean(AutoClean['Container']):
    PRIORITY = 90

    def __init__(self, instance: 'Container') -> None:
        super().__init__(instance)

        self.mode = instance.mode
        self.hash = instance.hash

        self._state = instance._state
        self._tree = instance._tree
        self._props_tree = instance._props_tree
        self.storage = instance.storage

        self._status_reporter = instance._status_reporter
        self._lock = instance._lock

    def _set_end_time(self):
        """
        Finalize the run by indexing all the data.
        """
        self._props_tree['end_time'] = utc_timestamp()

    def _wait_for_empty_queue(self):
        queue = self.storage.task_queue()
        if queue:
            queue.wait_for_finish()

    def _close(self) -> None:
        """
        Close the `Run` instance resources and trigger indexing.
        """
        if self.mode == ContainerOpenMode.READONLY:
            logger.debug(f'Run {self.hash} is read-only, skipping cleanup')
            return

        self._state['cleanup'] = True
        self._wait_for_empty_queue()
        if not self._state.get('deleted'):
            self._set_end_time()
        if self._status_reporter is not None:
            self._status_reporter.close()
        if self._lock:
            self._lock.release()


class Property:
    PROP_NAME_BLACKLIST = (  # do not allow property names to be dict class public methods
        'clear', 'copy', 'fromkeys', 'get', 'items', 'keys', 'pop', 'popitem', 'setdefault', 'update', 'values')

    def __init__(self, default=None):
        self._default = default
        self._name = None  # Will be set by __set_name__

    def __set_name__(self, owner, name):
        if name in Property.PROP_NAME_BLACKLIST:
            raise RuntimeError(f'Cannot define Aim Property with name \'{name}\'.')
        self._name = name

    def __get__(self, instance: 'Container', owner):
        if instance is None:
            return self
        return instance._get_property(self._name)

    def __set__(self, instance: 'Container', value: Any):
        instance._set_property(self._name, value)

    def initialize(self, instance: 'Container'):
        if callable(self._default):
            instance._set_property(self._name, self._default())
        else:
            instance._set_property(self._name, self._default)


@type_utils.query_alias('container', 'c')
@type_utils.auto_registry
class Container(ABCContainer):
    version = Property(default='1.0.0')
    creation_time = Property(default=utc_timestamp)

    def __init__(self, hash_: Optional[str] = None, *,
                 repo: Optional[Union[str, 'Repo']] = None,
                 mode: Optional[Union[str, ContainerOpenMode]] = ContainerOpenMode.WRITE):
        """
        Initializes the Container instance.

        Args:
            hash_ (str, optional): Unique identifier for the container.
            repo (Union[str, 'Repo'], optional): Repository path or Repo object.
            mode (Union[str, ContainerOpenMode], optional): Mode for the container (e.g., "READONLY" or "WRITE"). Defaults to "WRITE".
        """
        if isinstance(mode, str):
            mode = ContainerOpenMode[mode]
        self.mode = mode

        if repo is None:
            from aim._sdk.repo import Repo
            repo = Repo.default()
        elif isinstance(repo, str):
            from aim._sdk.repo import Repo
            read_only = True if mode == ContainerOpenMode.READONLY else False
            repo = Repo.from_path(repo, read_only=read_only)
        self.repo = repo
        self.storage = repo.storage_engine

        if hash_ is None:
            if not self._is_readonly:
                self.hash = generate_hash()
            else:
                raise MissingContainerError(hash_, mode)
        else:
            if hash_ in repo.container_hashes:
                self.hash = hash_
            else:
                raise MissingContainerError(hash_, mode)

        self._resources: Optional[ContainerAutoClean] = None
        self._hash = self._calc_hash()
        self._lock = None
        self._status_reporter = None
        self._state = {}

        if not self._is_readonly:
            self._lock = self.storage.lock(self.hash, 0)
            self._status_reporter = self.storage.status_reporter(self.hash)

        if self._is_readonly:
            self._meta_tree: TreeView = repo._meta_tree
        else:
            self._meta_tree: TreeView = self.storage.tree(self.hash, 'meta', read_only=self._is_readonly)

        self.__storage_init__()

        if not self._is_readonly:
            if hash_ is None:  # newly created Container
                self._tree[KeyNames.INFO_PREFIX, KeyNames.OBJECT_CATEGORY] = self.object_category
                container_type = self.get_full_typename()
                self._tree[KeyNames.INFO_PREFIX, KeyNames.CONTAINER_TYPE] = container_type
                self._meta_tree[KeyNames.CONTAINER_TYPES_MAP, self.hash] = container_type
                for typename in container_type.split('->'):
                    self._meta_tree[KeyNames.CONTAINERS, typename] = 1
                self[...] = {}

                Container._init_properties(self.__class__, self)

            self.end_time = None

        self._resources = ContainerAutoClean(self)

    @classmethod
    def from_storage(cls, storage, meta_tree: 'TreeView', *, hash_: str):
        """
        Restores a serialized container instance from given storage and meta tree.

        Args:
            storage: Storage backend instance.
            meta_tree ('TreeView'): Tree view of the metadata.
            hash_ (str): Unique identifier for the container.
        """
        self = cls.__new__(cls)
        self.mode = ContainerOpenMode.READONLY
        self.storage = storage
        self.hash = hash_

        self._resources = None
        self._hash = self._calc_hash()
        self._lock = None
        self._status_reporter = None
        self._state = {}
        self._meta_tree = meta_tree

        self.__storage_init__()
        return self

    @classmethod
    def filter(cls, expr: str = '', repo: 'Repo' = None) -> 'ContainerCollection':
        """
        Filters the containers based on the given expression and repository.

        Args:
            expr (str, optional): Query expression for filtering.
            repo ('Repo', optional): Repository instance. Defaults to the active Repo.
        """
        if repo is None:
            from aim._sdk.repo import Repo
            repo = Repo.active_repo()
        return repo.containers(query_=expr, type_=cls)

    @classmethod
    def find(cls, hash_: str) -> Optional['Container']:
        """
        Finds and returns a container instance based on the given hash.

        Args:
            hash_ (str): Unique identifier for the container.
        """
        from aim._sdk.repo import Repo
        repo = Repo.active_repo()
        try:
            return cls(hash_, repo=repo, mode='READONLY')
        except MissingContainerError:
            return None

    def __storage_init__(self):
        self._tree: TreeView = self._meta_tree.subtree('chunks').subtree(self.hash)
        self._meta_attrs_tree: TreeView = self._meta_tree.subtree('attrs')
        self._attrs_tree: TreeView = self._tree.subtree('attrs')

        self._meta_props_tree: TreeView = self._meta_tree.subtree('_props')
        self._props_tree: TreeView = self._tree.subtree('_props')

        self._data_loader: Callable[[], 'TreeView'] = lambda: self._sequence_data_tree
        self.__sequence_data_tree: TreeView = None
        self._sequence_map = ContainerSequenceMap(self, Sequence)

    @property
    def _is_readonly(self) -> bool:
        return self.mode == ContainerOpenMode.READONLY

    @property
    def _sequence_data_tree(self) -> 'TreeView':
        if self.__sequence_data_tree is None:
            self.__sequence_data_tree = self.storage.tree(
                self.hash, 'seqs', read_only=self._is_readonly).subtree('chunks').subtree(self.hash)
        return self.__sequence_data_tree

    def __setitem__(self, key, value):
        """
        Sets a value in the container for a given key.

        Args:
            key: Key to set the value for.
            value: Value to be set.
        """
        self._attrs_tree[key] = value
        self._meta_attrs_tree.merge(key, value)

    def set(self, key, value, strict: bool):
        """
        Sets a value in the container for a given key with optional strictness.

        Args:
            key: Key to set the value for.
            value: Value to be set.
            strict (bool): Whether to enforce strict setting.
        """
        self._attrs_tree.set(key, value, strict)
        self._meta_attrs_tree.set(key, value, strict)

    def __getitem__(self, key):
        """
        Retrieves a value from the container based on the given key.

        Args:
            key: Key for which value is to be retrieved.
        """
        return self._attrs_tree.collect(key, strict=True)

    def get(self, key, default: Any = None, strict: bool = False):
        """
        Retrieves a value from the container based on the key or returns a default value.

        Args:
            key: Key for which value is to be retrieved.
            default (optional): Default value to return if key doesn't exist.
            strict (bool, optional): Whether to enforce strict retrieval.
        """
        try:
            return self._attrs_tree.collect(key, strict=strict)
        except KeyError:
            return default

    def __delitem__(self, key):
        """
        Deletes a value in the container based on the given key.

        Args:
            key: Key for which the value is to be deleted.
        """
        del self._attrs_tree[key]

    def _set_property(self, name: str, value: Any):
        self._props_tree[name] = value
        self._meta_props_tree.merge(name, value)

    def _get_property(self, name: str, default: Any = None) -> Any:
        return self._props_tree.get(name, default)

    def collect_properties(self) -> Dict:
        """
        Collects and returns all properties associated with the container as a dictionary object.
        """
        try:
            return self._props_tree.collect()
        except KeyError:
            return {}

    def get_logged_typename(self) -> str:
        """
        Returns the typename of the logged data in the container.
        """
        return self._tree[KeyNames.INFO_PREFIX, KeyNames.CONTAINER_TYPE]

    def match(self, expr) -> bool:
        """
        Checks if the container matches the given expression.
        """
        query = RestrictedPythonQuery(expr)
        query_cache = {}
        return self._check(query, query_cache)

    def _check(self, query, query_cache, *, aliases=()) -> bool:
        proxy = ContainerQueryProxy(self.hash, self._tree, query_cache)

        if isinstance(aliases, str):
            aliases = (aliases,)
        alias_names = self.default_aliases.union(aliases)
        query_params = {p: proxy for p in alias_names}
        return query.check(**query_params)

    def delete_sequence(self, name, context=None):
        """
        Deletes a sequence from the container based on the given name and context.

        Args:
            name: Name of the sequence to delete.
            context (optional): Contextual information for the sequence. `{}` if not specified.
        """
        if self._is_readonly:
            raise RuntimeError('Cannot delete sequence in read-only mode.')

        context = {} if context is None else context
        sequence = self._sequence_map._sequence(name, context)
        sequence.delete()

    def delete(self):
        """
        Deletes the container and its associated data.
        """
        if self._is_readonly:
            raise RuntimeError('Cannot delete container in read-only mode.')

        # remove container meta tree
        meta_tree = self.storage.tree(self.hash, 'meta', read_only=False)
        del meta_tree.subtree('chunks')[self.hash]
        # remove container sequence tree
        seq_tree = self.storage.tree(self.hash, 'seqs', read_only=False)
        del seq_tree.subtree('chunks')[self.hash]

        # remove container blobs trees
        blobs_tree = self.storage.tree(self.hash, 'BLOBS', read_only=False)
        del blobs_tree.subtree(('meta', 'chunks'))[self.hash]
        del blobs_tree.subtree(('seqs', 'chunks'))[self.hash]

        # delete entry from container map
        del meta_tree.subtree('cont_types_map')[self.hash]

        # set a deleted flag
        self._state['deleted'] = True

        # close the container
        self.close()

    @property
    def sequences(self) -> 'ContainerSequenceMap':
        """
        Returns a map of sequences associated with the container.
        """
        return self._sequence_map

    # TODO [AT]: Implement end_time as a Property similar to other pre-defined props
    @property
    def end_time(self):
        return self._get_property('end_time')

    @end_time.setter
    def end_time(self, value):
        self._set_property('end_time', value)

    def __repr__(self) -> str:
        return f'<{self.get_typename()} #{hash(self)} hash={self.hash} mode={self.mode}>'

    def __hash__(self) -> int:
        return self._hash

    def _calc_hash(self):
        return hash_auto((self.hash, hash(self.storage.url), str(self.mode)))

    def close(self):
        """
        Closes the container and releases any associated resources.
        """
        self._resources._close()

    @staticmethod
    def _init_properties(cls: Type['Container'], inst: 'Container'):
        if cls != Container:
            for base_cls in cls.__bases__:
                if issubclass(base_cls, Container):
                    Container._init_properties(base_cls, inst)
        for attr in cls.__dict__.values():
            if isinstance(attr, Property):
                attr.initialize(inst)


class ContainerSequenceMap(SequenceMap[Sequence]):
    def __init__(self, container: Container, sequence_cls: Type[Sequence]):
        self._container: Container = container
        self._sequence_cls: Type[Sequence] = sequence_cls
        self._sequence_tree: 'TreeView' = container._tree.subtree(KeyNames.SEQUENCES)
        self._data_loader: Callable[[], 'TreeView'] = container._data_loader

    def __call__(self,
                 query_: Optional[str] = None,
                 type_: Union[str, Type[Sequence]] = Sequence,
                 **kwargs) -> SequenceCollection:
        """
        Retrieves a sequence collection based on a query expression.

        Args:
            query_ (str, optional): Query expression for filtering.
            type_ (Union[str, Type[Sequence]]): Sequence type or type name. Defaults to Sequence.
            **kwargs: Additional keyword arguments.

        Returns:
            SequenceCollection: The filtered sequence collection.
        """
        query_context = {
            'storage': self._container.storage,
            'var_name': None,
            'meta_tree': self._container._meta_tree,
            'query_cache': defaultdict(dict),
            KeyNames.ALLOWED_VALUE_TYPES: type_utils.get_sequence_value_types(type_),
            KeyNames.SEQUENCE_TYPE: type_,
            KeyNames.CONTAINER_TYPE: Container,
        }

        q = construct_query_expression('container', query_, **kwargs)
        seq_collection = ContainerSequenceCollection(self._container.hash, query_context)
        return seq_collection.filter(q) if q else seq_collection

    def __iter__(self) -> Iterator[Sequence]:
        """
        Returns an iterator over the sequences.

        Yields:
            Sequence: The next sequence in the container.
        """
        for ctx_idx in self._sequence_tree.keys():
            for name in self._sequence_tree.subtree(ctx_idx).keys():
                yield self._sequence_cls(self._container, name=name, context=ctx_idx)

    def __getitem__(self, item: Union[str, Tuple[str, Dict]]) -> Sequence:
        """
        Retrieves a sequence based on the given item (name or tuple of name and context).

        Args:
            item (Union[str, Tuple[str, Dict]]): Name of the sequence or a tuple of name and context.

        Returns:
            Sequence: The retrieved sequence.
        """
        if isinstance(item, str):
            name = item
            context = {}
        else:
            assert isinstance(item, tuple)
            name = item[0]
            context = {} if item[1] is None else item[1]

        return self._sequence(name, Context(context))

    def typed_sequence(self, sequence_type: Type[Sequence], name: str, context: Dict):
        """
        Retrieves a sequence of specified type based on the given name and context.

        Args:
            sequence_type (Type[Sequence]): The desired sequence type.
            name (str): Name of the sequence.
            context (Dict): Contextual information for the sequence.

        Returns:
            Sequence: The sequence instance.
        """
        return self._sequence(name, Context(context), sequence_type=sequence_type)

    @cachetools.func.ttl_cache()
    def _sequence(self, name: str, context: Context, *, sequence_type: Optional[Type[Sequence]] = None) -> Sequence:
        """
        Retrieves or creates a sequence based on the name, context, and optional type.

        Args:
            name (str): Name of the sequence.
            context (Context): Contextual information for the sequence.
            sequence_type (Type[Sequence], optional): Desired sequence type. Defaults to self._sequence_cls.

        Returns:
            Sequence: The sequence instance.
        """
        ctx_idx = context.idx
        try:
            self._sequence_tree.subtree((ctx_idx, name)).last_key()
            exists = True
        except KeyError:
            exists = False

        if self._container._is_readonly and not exists:
            raise ValueError('Cannot create sequence from a readonly container.')

        seq_cls = sequence_type or self._sequence_cls
        return seq_cls(self._container, name=name, context=context)

    def __delitem__(self, item: Union[str, Tuple[str, Dict]]):
        """
        Deletes a sequence based on the given item (name or tuple of name and context).

        Args:
            item (Union[str, Tuple[str, Dict]]): Name of the sequence or a tuple of name and context.
        """
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
