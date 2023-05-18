import logging

from collections import defaultdict
from typing import Union, Type, List, Optional

from aim.sdk.repo import Repo as LegacyRepo

from aim.sdk.core import type_utils
from aim.sdk.core.container import Container
from aim.sdk.core.sequence import Sequence
from aim.sdk.core.collections import ContainerCollection, SequenceCollection
from aim.sdk.core.query_utils import construct_query_expression
from aim.sdk.core.constants import KeyNames
# from aim.sdk.core.exceptions import AmbiguousQueryTypeError, UnknownQueryTypeError

from aim.sdk.core.storage_engine import StorageEngine
from aim.sdk.core.local_storage import LocalStorage
from aim.sdk.core.remote_storage import RemoteStorage

from aim.ext.system_info.resource_tracker import ResourceTracker

logger = logging.getLogger(__name__)


class Repo(LegacyRepo):
    def __init__(self, path: str, *, read_only: Optional[bool] = None, init: Optional[bool] = False):
        super().__init__(path, read_only=read_only, init=init)

        if self.is_remote_path(path):
            self._storage_engine = RemoteStorage(path, read_only=read_only)
        else:
            self._storage_engine = LocalStorage(path, read_only=read_only)

        self._system_tracker = None
        self._meta_tree = self._storage_engine.tree(hash_=None, name='meta', read_only=True)

    @property
    def storage_engine(self) -> StorageEngine:
        return self._storage_engine

    @property
    def resource_tracker(self) -> ResourceTracker:
        if self._system_tracker is None:
            self._system_tracker = ResourceTracker()
        return self._system_tracker

    @property
    def container_hashes(self):
        return list(self._meta_tree.subtree('chunks').keys())

    def tracked_container_types(self) -> List[str]:
        return list(self._meta_tree.subtree('containers').keys())

    def tracked_sequence_types(self) -> List[str]:
        return list(self._meta_tree.subtree('sequences').keys())

    def registered_container_types(self) -> List[str]:
        return list(Container.registry.keys())

    def registered_sequence_types(self) -> List[str]:
        return list(Sequence.registry.keys())

    def _select(self, type_: Type = None, **kwargs):
        if type_ is None:
            assert len(kwargs) == 1
            (var_name, type_) = kwargs.popitem()
        else:
            assert len(kwargs) == 0
            var_name = None

        query_context = {
            'repo': self,
            'storage': self.storage_engine,
            'var_name': var_name,
            'meta_tree': self._meta_tree,
            'query_cache': defaultdict(dict),
        }

        orig_type = type_.__origin__ if hasattr(type_, '__origin__') else type_

        if issubclass(orig_type, Container):
            query_context.update({
                KeyNames.CONTAINER_TYPES_MAP: self.meta_tree.subtree(KeyNames.CONTAINER_TYPES_MAP),
                KeyNames.CONTAINER_TYPE: type_,
                'required_typename': type_.get_full_typename(),
            })
            return ContainerCollection[type_](query_context=query_context)
        if issubclass(orig_type, Sequence):
            query_context.update({
                KeyNames.ALLOWED_VALUE_TYPES: type_utils.get_sequence_value_types(type_),
                KeyNames.CONTAINER_TYPE: Container,
                KeyNames.SEQUENCE_TYPE: type_,
                'required_typename': type_.get_full_typename(),
            })
            return SequenceCollection[type_](query_context=query_context)

    def containers(self,
                   query_: Optional[str] = None,
                   type_: Union[str, Type[Container]] = Container,
                   **kwargs) -> ContainerCollection:
        q = construct_query_expression('container', query_, **kwargs)

        if isinstance(type_, str):
            cont_types = Container.registry.get(type_)
            if len(cont_types) > 1:
                raise ValueError(f'Multiple matching container types for type name \'{type_}\'. '
                                 f'Please include container package name.')
            type_ = cont_types[0]

        return self._select(type_).filter(q) if q else self._select(type_)

    def sequences(self,
                  query_: Optional[str] = None,
                  type_: Union[str, Type[Sequence]] = Sequence,
                  **kwargs) -> SequenceCollection:
        q = construct_query_expression('sequence', query_, **kwargs)

        if isinstance(type_, str):
            seq_types = Sequence.registry.get(type_)
            if len(seq_types) > 1:
                raise ValueError(f'Multiple matching sequence types for type name \'{type_}\'. '
                                 f'Please include sequence package name.')
            type_ = seq_types[0]

        return self._select(type_).filter(q) if q else self._select(type_)
