from abc import abstractmethod
import logging
from collections import defaultdict
from typing import Iterator, Dict, Tuple, Type

from aim._sdk import type_utils
from aim._sdk.query_utils import ContainerQueryProxy, SequenceQueryProxy

from aim._sdk.constants import KeyNames

from aim._sdk.interfaces.container import ContainerCollection as ABCContainerCollection, ContainerType
from aim._sdk.interfaces.sequence import SequenceCollection as ABCSequenceCollection, SequenceType

from aim._sdk.query import RestrictedPythonQuery
from aim._sdk.context import Context, cached_context

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from aim._sdk.container import Container
    from aim._sdk.sequence import Sequence
    from aim._core.storage.treeview import TreeView

logger = logging.getLogger(__name__)


class ContainerCollectionBase(ABCContainerCollection[ContainerType]):
    def __init__(self, query_context: Dict):
        self.query_context = query_context
        self.ctype: Type['Container'] = query_context[KeyNames.CONTAINER_TYPE]

    @abstractmethod
    def __iter_meta__(self) -> Iterator[str]:
        ...

    def __iter__(self) -> Iterator['Container']:
        meta_tree = self.query_context['meta_tree']
        storage = self.query_context['storage']
        for hash_ in self.__iter_meta__():
            yield self.ctype.from_storage(storage, meta_tree, hash_=hash_)

    def count(self) -> int:
        # more optimal implementation
        return sum(1 for _ in self.__iter_meta__())

    def delete(self):
        repo = self.query_context['repo']
        for hash_ in self.__iter_meta__():
            repo.delete_container(hash_)


class ContainerLimitCollection(ContainerCollectionBase['Container']):
    def __init__(self, base_collection: ContainerCollectionBase['Container'], n: int, query_context):
        super().__init__(query_context)

        self.base_collection = base_collection
        self.limit = n

    def __iter_meta__(self) -> Iterator[str]:
        for i, hash_ in enumerate(self.base_collection.__iter_meta__()):
            if i >= self.limit:
                break
            yield hash_

    def filter(self, expr: str) -> ABCContainerCollection['Container']:
        return ContainerFilterCollection(self, expr, self.query_context)

    def limit(self, n: int) -> ABCContainerCollection['Container']:
        return ContainerLimitCollection(self, n, self.query_context)


class ContainerFilterCollection(ContainerCollectionBase['Container']):
    def __init__(self, base_collection: ContainerCollectionBase['Container'], filter_expr: str, query_context: Dict):
        super().__init__(query_context)

        self.base_collection = base_collection
        self.filter_expr = filter_expr
        self.query = RestrictedPythonQuery(self.filter_expr)

    def __iter_meta__(self) -> Iterator[str]:
        var_name = self.query_context['var_name']
        aliases = (var_name,) if var_name else ()
        alias_names = self.ctype.default_aliases.union(aliases)

        query_cache = self.query_context['query_cache']
        for hash_ in self.base_collection.__iter_meta__():
            cont_tree: 'TreeView' = self.query_context['meta_tree'].subtree('chunks').subtree(hash_)

            proxy = ContainerQueryProxy(hash_, cont_tree, query_cache[hash_])
            query_params = {p: proxy for p in alias_names}
            if self.query.check(**query_params):
                yield hash_

    def filter(self, expr: str) -> ABCContainerCollection['Container']:
        return ContainerFilterCollection(self, expr, self.query_context)

    def limit(self, n: int) -> ABCContainerCollection['Container']:
        return ContainerLimitCollection(self, n, self.query_context)


class ContainerCollection(ContainerCollectionBase['Container']):
    def __init__(self, query_context: Dict):
        super().__init__(query_context)

        type_infos = self.query_context[KeyNames.CONTAINER_TYPES_MAP]
        required_typename = self.query_context['required_typename']

        def type_match(hash_) -> bool:
            return type_utils.is_subtype(type_infos.get(hash_, ''), required_typename)

        self.hashes = filter(type_match, self.query_context['repo'].container_hashes)

    def __iter_meta__(self) -> Iterator[str]:
        yield from self.hashes

    def filter(self, expr: str) -> ABCContainerCollection['Container']:
        return ContainerFilterCollection(self, expr, self.query_context)

    def limit(self, n: int) -> ABCContainerCollection['Container']:
        return ContainerLimitCollection(self, n, self.query_context)


class SequenceCollectionBase(ABCSequenceCollection[SequenceType]):
    def __init__(self, query_context: Dict):
        self.query_context = query_context
        self.stype: Type[Sequence] = query_context[KeyNames.SEQUENCE_TYPE]
        self.ctype: Type['Container'] = query_context[KeyNames.CONTAINER_TYPE]
        self._containers: Dict = {}

    @abstractmethod
    def __iter_meta__(self) -> Iterator[Tuple[str, str, int]]:
        ...

    def __iter__(self) -> Iterator['Sequence']:
        meta_tree = self.query_context['meta_tree']
        storage = self.query_context['storage']
        for hash_, name, context in self.__iter_meta__():
            yield self.stype.from_storage(storage, meta_tree, hash_=hash_, name=name, context=context)

    def count(self):
        # more optimal implementation
        return sum(1 for _ in self.__iter_meta__())

    def delete(self):
        from aim._sdk import Container
        from aim._sdk.lock_manager import RunLockingError
        repo = self.query_context['repo']
        container_sequence_map = defaultdict(list)
        for hash_, name, context in self.__iter_meta__():
            container_sequence_map[hash_].append((name, context))

        for hash_ in container_sequence_map.keys():
            try:
                container = Container(hash_, repo=repo, mode='WRITE')
                for name, context in container_sequence_map[hash_]:
                    container.delete_sequence(name, context)
            except RunLockingError:
                logger.warning(f'Cannot delete sequences for container: {hash_}. Container is locked.')


class SequenceLimitCollection(SequenceCollectionBase['Sequence']):
    def __init__(self, base_collection: SequenceCollectionBase['Sequence'], n: int, query_context: Dict):
        super().__init__(query_context)

        self.base_collection = base_collection
        self.limit = n

    def __iter_meta__(self) -> Iterator['Sequence']:
        for i, (hash_, name, context) in enumerate(self.base_collection.__iter_meta__()):
            if i >= self.limit:
                break
            yield hash_, name, context

    def filter(self, expr: str) -> ABCSequenceCollection['Sequence']:
        return SequenceFilterCollection(self, expr, self.query_context)

    def limit(self, n: int) -> ABCSequenceCollection['Sequence']:
        return SequenceLimitCollection(self, n, self.query_context)


class SequenceFilterCollection(SequenceCollectionBase['Sequence']):
    def __init__(self, base_collection: SequenceCollectionBase['Sequence'], filter_expr: str, query_context: Dict):
        super().__init__(query_context)

        self.base_collection = base_collection
        self.filter_expr = filter_expr
        self.query = RestrictedPythonQuery(self.filter_expr)

    def __iter_meta__(self) -> Iterator[Tuple[str, str, Dict]]:
        var_name = self.query_context['var_name']
        aliases = (var_name,) if var_name else ()
        alias_names = self.stype.default_aliases.union(aliases)
        container_alias_names = self.ctype.default_aliases

        query_cache = self.query_context['query_cache']
        for hash_, name, ctx_idx in self.base_collection.__iter_meta__():
            cont_tree: 'TreeView' = self.query_context['meta_tree'].subtree('chunks').subtree(hash_)
            seq_tree: 'TreeView' = cont_tree.subtree((KeyNames.SEQUENCES, ctx_idx, name))

            proxy = SequenceQueryProxy(name, self._context_from_idx, ctx_idx, seq_tree, query_cache[hash_])
            c_proxy = ContainerQueryProxy(hash_, cont_tree, query_cache[hash_])
            query_params = {p: proxy for p in alias_names}

            query_params.update({cp: c_proxy for cp in container_alias_names})
            if self.query.check(**query_params):
                yield hash_, name, ctx_idx

    @cached_context
    def _context_from_idx(self, ctx_idx) -> Context:
        return Context(self.query_context['meta_tree'][KeyNames.CONTEXTS, ctx_idx])

    def filter(self, expr: str) -> ABCSequenceCollection['Sequence']:
        return SequenceFilterCollection(self, expr, self.query_context)

    def limit(self, n: int) -> ABCSequenceCollection['Sequence']:
        return SequenceLimitCollection(self, n, self.query_context)


class ContainerSequenceCollection(SequenceCollectionBase['Sequence']):
    def __init__(self, hash_, query_context: Dict):
        super().__init__(query_context)

        self.hash = hash_
        self.required_typename = self.query_context['required_typename']
        self.allowed_dtypes = self.query_context[KeyNames.ALLOWED_VALUE_TYPES]

        self._container: Container = None
        self._meta_tree = self.query_context['meta_tree']
        self._sequence_tree = self._meta_tree.subtree('chunks').subtree(hash_).subtree(KeyNames.SEQUENCES)

    def __iter_meta__(self) -> Iterator[Tuple[str, str, Dict]]:
        for context_idx, context_dict in self._sequence_tree.items():
            for name in context_dict.keys():
                item_type = context_dict[name][KeyNames.INFO_PREFIX][KeyNames.VALUE_TYPE]
                sequence_typename = context_dict[name][KeyNames.INFO_PREFIX][KeyNames.SEQUENCE_TYPE]
                if type_utils.is_subtype(sequence_typename, self.required_typename) and \
                   type_utils.is_allowed_type(item_type, self.allowed_dtypes):
                    yield self.hash, name, context_idx

    def filter(self, expr: str) -> ABCSequenceCollection['Sequence']:
        return SequenceFilterCollection(self, expr, self.query_context)

    def limit(self, n: int) -> ABCSequenceCollection['Sequence']:
        return SequenceLimitCollection(self, n, self.query_context)


class SequenceCollection(SequenceCollectionBase['Sequence']):
    def __init__(self, query_context: Dict):
        super().__init__(query_context)
        self.hashes = self.query_context['repo'].container_hashes

    def __iter_meta__(self) -> Iterator[Tuple[str, str, Dict]]:
        for hash_ in self.hashes:
            coll = ContainerSequenceCollection(hash_, self.query_context)
            yield from coll.__iter_meta__()

    def filter(self, expr: str) -> ABCSequenceCollection['Sequence']:
        return SequenceFilterCollection(self, expr, self.query_context)

    def limit(self, n: int) -> ABCSequenceCollection['Sequence']:
        return SequenceLimitCollection(self, n, self.query_context)
