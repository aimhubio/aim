import itertools
from typing import Iterator, Dict, Type

from aim.sdk.core import type_utils
from aim.sdk.core.container import Container
from aim.sdk.core.sequence import Sequence
from aim.sdk.core.constants import KeyNames

from aim.sdk.core.interfaces.container import ContainerCollection as ABCContainerCollection
from aim.sdk.core.interfaces.sequence import SequenceCollection as ABCSequenceCollection

from aim.storage.query import RestrictedPythonQuery


class ContainerLimitCollection(ABCContainerCollection[Container]):
    def __init__(self, base_collection: ABCContainerCollection[Container], n: int, query_context):
        self.query_context = query_context

        self.base_collection = base_collection
        self.limit = n

    def __iter__(self) -> Iterator[Container]:
        for i, container in enumerate(self.base_collection):
            if i >= self.limit:
                break
            yield container

    def filter(self, expr: str) -> 'ABCContainerCollection[Container]':
        return ContainerFilterCollection(self, expr, self.query_context)

    def limit(self, n: int) -> ABCContainerCollection[Container]:
        return ContainerLimitCollection(self, n, self.query_context)


class ContainerFilterCollection(ABCContainerCollection[Container]):
    def __init__(self, base_collection: ABCContainerCollection[Container], filter_expr: str, query_context: Dict):
        self.query_context = query_context

        self.base_collection = base_collection
        self.filter_expr = filter_expr
        self.query = RestrictedPythonQuery(self.filter_expr)

    def __iter__(self) -> Iterator[Container]:
        var_name = self.query_context['var_name']
        aliases = (var_name,) if var_name else ()
        query_cache = self.query_context['query_cache']
        for container in self.base_collection:
            if container._check(self.query, query_cache, aliases=aliases):
                yield container

    def filter(self, expr: str) -> 'ABCContainerCollection[Container]':
        return ContainerFilterCollection(self, expr, self.query_context)

    def limit(self, n: int) -> ABCContainerCollection[Container]:
        return ContainerLimitCollection(self, n, self.query_context)


class ContainerCollection(ABCContainerCollection[Container]):
    def __init__(self, query_context: Dict):
        self.query_context = query_context

        type_infos = self.query_context[KeyNames.CONTAINER_TYPES]
        self.ctype = self.query_context[KeyNames.CONTAINER_TYPE]
        required_typename = self.ctype.get_full_typename()

        def type_match(hash_) -> bool:
            return type_utils.is_subtype(type_infos.get(hash_, ''), required_typename)

        self.hashes = filter(type_match, self.query_context['storage'].container_hashes())

    def __iter__(self) -> Iterator[Container]:
        for hash_ in self.hashes:
            yield self.ctype(hash_, repo=self.query_context['repo'], mode='READONLY')

    def filter(self, expr: str) -> 'ABCContainerCollection[Container]':
        return ContainerFilterCollection(self, expr, self.query_context)

    def limit(self, n: int) -> ABCContainerCollection[Container]:
        return ContainerLimitCollection(self, n, self.query_context)


class SequenceLimitCollection(ABCSequenceCollection[Sequence]):
    def __init__(self, base_collection: ABCSequenceCollection[Sequence], n: int, query_context: Dict):
        self.query_context = query_context

        self.base_collection = base_collection
        self.limit = n

    def __iter__(self) -> Iterator[Sequence]:
        for i, sequence in enumerate(self.base_collection):
            if i >= self.limit:
                break
            yield sequence

    def filter(self, expr: str) -> ABCSequenceCollection[Sequence]:
        return SequenceFilterCollection(self, expr, self.query_context)

    def limit(self, n: int) -> ABCSequenceCollection[Sequence]:
        return SequenceLimitCollection(self, n, self.query_context)


class SequenceFilterCollection(ABCSequenceCollection[Sequence]):
    def __init__(self, base_collection: ABCSequenceCollection[Sequence], filter_expr: str, query_context: Dict):
        self.query_context = query_context

        self.base_collection = base_collection
        self.filter_expr = filter_expr
        self.query = RestrictedPythonQuery(self.filter_expr)

    def __iter__(self) -> Iterator[Sequence]:
        var_name = self.query_context['var_name']
        aliases = (var_name,) if var_name else ()
        query_cache = self.query_context['query_cache']
        for sequence in self.base_collection:
            if sequence._check(self.query, query_cache, aliases=aliases):
                yield sequence
                
    def filter(self, expr: str) -> ABCSequenceCollection[Sequence]:
        return SequenceFilterCollection(self, expr, self.query_context)

    def limit(self, n: int) -> ABCSequenceCollection[Sequence]:
        return SequenceLimitCollection(self, n, self.query_context)


class ContainerSequenceCollection(ABCSequenceCollection[Sequence]):
    def __init__(self, container_hash, query_context: Dict):
        self.query_context = query_context
        self.container_hash = container_hash
        self.stype: Type[Sequence] = self.query_context[KeyNames.SEQUENCE_TYPE]
        self.required_typename = self.stype.get_full_typename()
        self.allowed_dtypes = self.query_context[KeyNames.ALLOWED_VALUE_TYPES]

        self._container: Container = None
        self._meta_tree = self.query_context['storage'].tree('meta', container_hash, read_only=True)
        self._sequence_tree = self._meta_tree.subtree('chunks').subtree(self.container_hash).subtree(KeyNames.SEQUENCES)

    def __iter__(self) -> Iterator[Sequence]:
        for context_idx in self._sequence_tree.keys():
            context = self._meta_tree[KeyNames.CONTEXTS, context_idx]
            for name in self._sequence_tree.subtree(context_idx).keys():
                item_type = self._sequence_tree.subtree((context_idx, name))[KeyNames.INFO_PREFIX, KeyNames.VALUE_TYPE]
                sequence_typename = self._sequence_tree.subtree((context_idx, name))[KeyNames.INFO_PREFIX, KeyNames.SEQUENCE_TYPE]
                if type_utils.is_subtype(sequence_typename, self.required_typename) and \
                   type_utils.is_allowed_type(item_type, self.allowed_dtypes):
                    yield self.stype(self._get_container(), name=name, context=context)

    def _get_container(self) -> Container:
        if self._container is None:
            self._container = Container(self.container_hash, repo=self.query_context['repo'], mode='READONLY')
        return self._container

    def filter(self, expr: str) -> ABCSequenceCollection[Sequence]:
        return SequenceFilterCollection(self, expr, self.query_context)

    def limit(self, n: int) -> ABCSequenceCollection[Sequence]:
        return SequenceLimitCollection(self, n, self.query_context)


class SequenceCollection(ABCSequenceCollection[Sequence]):
    def __init__(self, query_context: Dict):
        self.query_context = query_context
        self.hashes = self.query_context['storage'].container_hashes()

    def __iter__(self) -> Iterator[Sequence]:
        return itertools.chain.from_iterable(
            ContainerSequenceCollection(hash_, self.query_context) for hash_ in self.hashes)

    def filter(self, expr: str) -> ABCSequenceCollection[Sequence]:
        return SequenceFilterCollection(self, expr, self.query_context)

    def limit(self, n: int) -> ABCSequenceCollection[Sequence]:
        return SequenceLimitCollection(self, n, self.query_context)
