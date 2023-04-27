from typing import TypeVar, Generic, Any, Optional, Dict, Union, Tuple, List, Iterator, Callable

from aim.sdk.core import type_utils
from aim.sdk.core.utils import utc_timestamp
from aim.sdk.core.interfaces.sequence import Sequence as ABCSequence
from aim.sdk.core.query_utils import SequenceQueryProxy, ContainerQueryProxy
from aim.sdk.core.constants import KeyNames

from aim.storage.context import Context, cached_context
from aim.storage.query import RestrictedPythonQuery

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from aim.storage.treeview import TreeView
    from aim.sdk.core.container import Container


_ContextInfo = Union[Dict, Context, int]


class _SequenceInfo:
    def __init__(self, info_tree: 'TreeView'):
        self._meta_tree = info_tree

        self._initialized = False
        self.next_step = None
        self.version = None
        self.first_step = None
        self.last_step = None
        self.creation_time = None
        self.axis_names: List[str] = []
        self.dtype = None
        self.empty = None

    def preload(self):
        if self._initialized:
            return

        info = self._meta_tree.subtree(KeyNames.INFO_PREFIX)

        try:
            info.preload()
            self.version = info['version']
            self.first_step = info['first_step']
            self.last_step = info['last_step']
            self.creation_time = info['creation_time']
            self.axis_names = info['axis']
            self.dtype = info[KeyNames.VALUE_TYPE]
            self.stype = info[KeyNames.SEQUENCE_TYPE]
            self.empty = False
            self.next_step = self.last_step + 1
        except KeyError:
            self.empty = True
            self.next_step = 0
        finally:
            self._initialized = True


ItemType = TypeVar('ItemType')


@type_utils.query_alias('sequence', 's')
@type_utils.auto_registry
class Sequence(Generic[ItemType], ABCSequence):
    version = '1.0.0'

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        typename = cls.get_typename()
        if typename is not None:  # check for intermediate helper classes
            cls.registry[typename] = cls

    def __init__(self, container: 'Container', *, name: str, context: _ContextInfo):
        self._container: 'Container' = container
        self._meta_tree = container._meta_tree
        self._container_tree = container._tree

        self._name = name

        self._ctx_idx: int = None
        self._context: Context = None
        self._init_context(context)

        self._data_loader: Callable[[], 'TreeView'] = container._data_loader
        self.__data = None

        self.__storage_init__()

    def __storage_init__(self):
        self._tree = self._container_tree.subtree((KeyNames.SEQUENCES, self._ctx_idx, self._name))

        self._values = None
        self._axis = {}
        self._info = _SequenceInfo(self._tree)
        self._allowed_value_types = None

    @classmethod
    def from_storage(cls, storage, meta_tree: 'TreeView', *, hash_: str, name: str, context: _ContextInfo):
        self = cls.__new__(cls)
        self._container = None
        self._meta_tree = meta_tree
        self._container_tree = meta_tree.subtree('chunks').subtree(hash_)

        self._name = name

        self._ctx_idx = None
        self._context = None
        self._init_context(context)

        self._data_loader = lambda: storage.tree('seqs', hash_, read_only=True)
        self.__data = None

        self.__storage_init__()
        return self

    def _init_context(self, context: _ContextInfo):
        if isinstance(context, int):
            self._ctx_idx = context
            self._context = None
        elif isinstance(context, dict):
            self._context = Context(context)
            self._ctx_idx = self._context.idx
        elif isinstance(context, Context):
            self._context = context
            self._ctx_idx = self._context.idx

    @property
    def name(self):
        return self._name

    @property
    def context(self) -> Dict:
        if self._context is None:
            self._context = self._context_from_idx(ctx_idx=self._ctx_idx)
        return self._context.to_dict()

    @cached_context
    def _context_from_idx(self, ctx_idx) -> Context:
        return Context(self._meta_tree[KeyNames.CONTEXTS, ctx_idx])

    @property
    def type(self) -> str:
        self._info.preload()
        return self._info.dtype

    @property
    def is_empty(self) -> bool:
        self._info.preload()
        return self._info.empty

    def match(self, expr) -> bool:
        query = RestrictedPythonQuery(expr)
        query_cache = dict
        return self._check(query, query_cache)

    @property
    def axis_names(self) -> List[str]:
        self._info.preload()
        return self._info.axis_names

    def axis(self, name: str) -> Iterator[Any]:
        return self._data.array(name).values()

    @property
    def allowed_value_types(self) -> Tuple[str]:
        if self._allowed_value_types is None:
            sequence_class = self.__sequence_class__
            self._allowed_value_types = type_utils.get_sequence_value_types(sequence_class)

        return self._allowed_value_types

    def track(self, value: Any, *, step: Optional[int] = None, **axis):
        value_type = type_utils.get_object_typename(value)
        if not type_utils.is_allowed_type(value_type, self.allowed_value_types):
            raise ValueError(f'Cannot track value \'{value}\' of type {type(value)}. Type is not supported.')

        self._info.preload()
        if step is None:
            step = self._info.next_step

        if self._info.empty:
            self._tree[KeyNames.INFO_PREFIX, 'creation_time'] = utc_timestamp()
            self._tree[KeyNames.INFO_PREFIX, 'version'] = self.version
            self._tree[KeyNames.INFO_PREFIX, KeyNames.OBJECT_CATEGORY] = self.object_category
            self._tree[KeyNames.INFO_PREFIX, 'first_step'] = self._info.first_step = step
            self._tree[KeyNames.INFO_PREFIX, 'last_step'] = self._info.last_step = step
            self._tree[KeyNames.INFO_PREFIX, 'axis'] = self._info.axis_names = tuple(axis.keys())
            self._tree[KeyNames.INFO_PREFIX, KeyNames.VALUE_TYPE] = self._info.dtype = value_type
            self._tree[KeyNames.INFO_PREFIX, KeyNames.SEQUENCE_TYPE] = self.get_full_typename()

            self._meta_tree[KeyNames.CONTEXTS, self._ctx_idx] = self._context.to_dict()
            self._container_tree[KeyNames.CONTEXTS, self._ctx_idx] = self._context.to_dict()
            self._meta_tree[KeyNames.SEQUENCES, self.get_typename()] = 1
            # self._container_tree[KeyNames.SEQUENCES, self.get_typename()] = 1

            self._tree['first_value'] = value
            self._tree['last_value'] = value
            self._info.empty = False

        if step > self._info.last_step:
            self._tree[KeyNames.INFO_PREFIX, 'last_step'] = step
            self._tree['last_value'] = value
            self._info.last_step = step
        if step < self._info.first_step:
            self._tree[KeyNames.INFO_PREFIX, 'first_step'] = step
            self._tree['first_value'] = value
            self._info.first_step = step
        if not type_utils.is_subtype(value_type, self._info.dtype):
            dtype = type_utils.get_common_typename((value_type, self._info.dtype))
            self._tree[KeyNames.INFO_PREFIX, KeyNames.VALUE_TYPE] = self._info.dtype = dtype

        if self._values is None:
            self._values = self._data.array('val').allocate()
        self._values[step] = value
        for k, v in axis.items():
            self._axis.setdefault(k, self._data.array(k).allocate())[step] = v
        self._info.next_step = self._info.last_step + 1

    def items(self) -> Iterator[Tuple[int, Any]]:
        return self._data.array('val').items()

    def __iter__(self) -> Iterator[Tuple[int, Tuple[Any, ...]]]:
        data_iterator = zip(self.items(), zip(map(self.axis, self.axis_names)))
        for (step, value), axis_values in data_iterator:
            yield step, (value,) + axis_values

    @property
    def _data(self) -> 'TreeView':
        if self.__data is None:
            self.__data = self._data_loader().subtree((self._ctx_idx, self._name))
        return self.__data

    @property
    def __sequence_class__(self):
        if hasattr(self, '__orig_class__'):
            return self.__orig_class__
        return self.__class__

    def _check(self, query, query_cache, *, aliases=()) -> bool:
        hash_ = self._container.hash
        proxy = SequenceQueryProxy(self.name, self._context_from_idx, self._ctx_idx, self._tree, query_cache[hash_])
        c_proxy = ContainerQueryProxy(self._container_tree, query_cache[hash_])

        if isinstance(aliases, str):
            aliases = (aliases,)
        alias_names = self.default_aliases.union(aliases)
        container_alias_names = self._container.default_aliases

        query_params = {p: proxy for p in alias_names}
        query_params.update({cp: c_proxy for cp in container_alias_names})
        return query.check(**query_params)

    def __repr__(self) -> str:
        return f'<{self.get_typename()} #{hash(self)} name={self.name} context={self._ctx_idx}>'
