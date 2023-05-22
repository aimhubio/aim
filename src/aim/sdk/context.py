from copy import deepcopy
from functools import wraps
from typing import Iterator, Dict, Optional

from aim._core.storage.hashing import hash_auto
from aim._core.storage.types import AimObject, AimObjectKey


class Context:
    __slots__ = ('_context', '_hash')

    _context_cache: Dict[int, 'Context'] = {}

    @staticmethod
    def from_idx(idx: int) -> Optional['Context']:
        return Context._context_cache.get(idx)

    @staticmethod
    def cache(idx: int, ctx: 'Context'):
        Context._context_cache[idx] = ctx

    def __init__(
        self,
        context: AimObject
    ):
        if context is None:
            context = {}
        self._context = deepcopy(context)
        self._hash = None

    @property
    def idx(self) -> int:
        return hash(self)

    def __repr__(self) -> str:
        return f'<Context#{hash(self)} {self._context}>'

    def to_dict(self) -> AimObject:
        return self._context

    def __iter__(self) -> Iterator[AimObjectKey]:
        return iter(self._context)

    def __len__(self) -> int:
        return len(self._context)

    def __getitem__(self, idx) -> AimObject:
        return self._context[idx]

    def _calc_hash(self) -> int:
        return hash_auto(self._context)

    def __hash__(self) -> int:
        if self._hash is None:
            self._hash = self._calc_hash()
        return self._hash

    def __eq__(self, other: 'Context') -> bool:
        if hash(self) != hash(other):
            return False
        return self._context == other._context


def cached_context(func):
    @wraps(func)
    def wrapper(*args, ctx_idx: int, **kwargs) -> Context:
        ctx = Context.from_idx(ctx_idx)
        if ctx is None:
            ctx = func(*args, ctx_idx=ctx_idx, **kwargs)
            Context.cache(ctx_idx, ctx)
        return ctx
    return wrapper
