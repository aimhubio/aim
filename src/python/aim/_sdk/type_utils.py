import numbers
import os

from collections import defaultdict
from typing import Iterator, Tuple, Type, Optional, Any, TypeVar, Union

try:
    from typing import get_args, get_origin
except ImportError:
    # Support for get_args get_origin functions for Python 3.7
    def get_args(tp):
        return tp.__args__

    def get_origin(tp):
        if hasattr(tp, '__origin__'):
            return tp.__origin__
        return None


from aim._sdk.record import Record

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from aim._sdk.sequence import Sequence


def get_typename(type_: Type, inner_type: Optional[Type] = None) -> str:
    if issubclass(type_, int):
        return f'{Record.get_typename()}->aim.Number->aim.Int'
    if issubclass(type_, float):
        return f'{Record.get_typename()}->aim.Number->aim.Float'
    if issubclass(type_, numbers.Number):
        return f'{Record.get_typename()}->aim.Number'
    if issubclass(type_, str):
        return f'{Record.get_typename()}->aim.String'
    if issubclass(type_, Record):
        return type_.get_full_typename()
    if issubclass(type_, list):
        if inner_type:
            return f'{Record.get_typename()}->aim.List[{get_typename(inner_type)}]'
        else:
            return f'{Record.get_typename()}->aim.List[]'
    return ''


def get_object_typename(obj: Any) -> str:
    if isinstance(obj, list) and len(obj) > 0:
        return get_typename(type(obj), type(obj[0]))
    else:
        return get_typename(type(obj))


def get_common_typename(types: Iterator[str]) -> str:
    types_min = min(types)
    types_max = max(types)
    if is_subtype(types_max, types_min):
        return types_min
    common_type = os.path.commonprefix((types_min, types_max))
    idx = common_type.rfind('->')
    return common_type[:idx]


def is_subtype(type_: str, base_type: str) -> bool:
    return type_.startswith(base_type)


def is_allowed_type(type_: str, type_list: Tuple[str]) -> bool:
    for base_type in type_list:
        if type_.startswith(base_type):
            return True
    return False


def get_sequence_value_types(seq_type: Type['Sequence']) -> Tuple[str, ...]:
    if hasattr(seq_type, '__record_type__'):
        item_type = seq_type.__record_type__
    elif hasattr(seq_type, '__args__'):
        item_type = get_args(seq_type)[0]
    elif hasattr(seq_type, '__orig_bases__'):
        item_type = seq_type.__orig_bases__[0].__args__[0]
    else:
        return ()

    if isinstance(item_type, TypeVar):
        if item_type.__bound__ is not None:
            item_type = item_type.__bound__
        elif item_type.__constraints__ != ():
            item_type = Union[item_type.__constraints__]
        else:
            return Record.get_typename(),

    def _get_generic_typename(type_):
        if hasattr(type_, '__origin__'):
            return get_typename(type_.__origin__, type_.__args__[0])
        else:
            return get_typename(type_)

    if get_origin(item_type) == Union:
        return tuple(map(_get_generic_typename, item_type.__args__))
    else:
        return _get_generic_typename(item_type),


def auto_registry(cls):
    @classmethod
    def get_typename_fn(cls_) -> str:
        if hasattr(cls_, '__aim_package__'):
            return f'{cls_.__aim_package__}.{cls_.__name__}'
        return cls_.__name__

    @classmethod
    def get_full_typename_fn(cls_) -> str:
        if cls_ == cls:
            return cls_.get_typename()
        for base in cls_.__bases__:
            if issubclass(base, cls):
                base_typename = base.get_full_typename()
                typename = cls_.get_typename()
                return '->'.join((base_typename, typename))

    cls.get_typename = get_typename_fn
    cls.get_full_typename = get_full_typename_fn
    cls.registry = defaultdict(list)
    cls.registry[cls.get_typename()].append(cls)
    cls.default_aliases = set()
    cls.object_category = cls.get_typename()

    return cls


def query_alias(*names: str):
    def cls_decorator(cls):
        cls.default_aliases.update(names)
        return cls
    return cls_decorator
