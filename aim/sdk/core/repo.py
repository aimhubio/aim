import pathlib
import weakref

from collections import defaultdict
from typing import Union, Type, Optional

from aim.sdk.repo import Repo as LegacyRepo

from aim.sdk.core import type_utils
from aim.sdk.core.container import Container
from aim.sdk.core.sequence import Sequence
from aim.sdk.core.collections import ContainerCollection, SequenceCollection
from aim.sdk.core.query_utils import construct_query_expression
from aim.sdk.core.constants import ContainerOpenMode, KeyNames
from aim.sdk.core.exceptions import AmbiguousQueryTypeError, UnknownQueryTypeError

from aim.sdk.reporter import RunStatusReporter, ScheduledStatusReporter
from aim.sdk.reporter.file_manager import LocalFileManager
from aim.sdk.remote_run_reporter import RemoteRunHeartbeatReporter, RemoteFileManager


class StorageEngine:
    def __init__(self, repo: LegacyRepo):
        self.repo = weakref.ref(repo)

    @property
    def url(self):
        return self.repo().root_path

    def container_hashes(self):
        return self.repo()._all_run_hashes()

    def tree(self, path, hash_, read_only):
        return self.repo().request_tree(name=path, sub=hash_, read_only=read_only, from_union=True).subtree(path)

    def lock(self, hash_: str, mode: ContainerOpenMode):
        lock = self.repo().request_run_lock(hash_)
        lock.lock(force=(mode == ContainerOpenMode.FORCEWRITE))
        return lock

    def status_reporter(self, hash_: str) -> RunStatusReporter:
        if self.repo().is_remote_repo:
            return RunStatusReporter(hash_, RemoteFileManager(self.repo()._client, hash_))
        else:
            return RunStatusReporter(hash_, LocalFileManager(self.repo().path))

    def heartbeat_reporter(self, hash_: str, status_reporter: RunStatusReporter):
        if self.repo().is_remote_repo:
            return RemoteRunHeartbeatReporter(self.repo()._client, hash_)
        else:
            progress_flag_path = pathlib.Path(self.repo().path) / 'meta' / 'progress' / hash_
            return ScheduledStatusReporter(status_reporter, touch_path=progress_flag_path)

    def task_queue(self, hash_: str):
        if self.repo().is_remote_repo:
            return self.repo()._client.get_queue(hash_)
        else:
            return None

    def remote_task_queue(self, hash_: str):
        if self.repo().is_remote_repo:
            self.repo()._client.remove_queue(hash_)


class Repo(LegacyRepo):
    def __init__(self, path: str, *, read_only: Optional[bool] = None, init: Optional[bool] = False):
        super().__init__(path, read_only=read_only, init=init)
        self._storage_engine = StorageEngine(self)

    @property
    def storage_engine(self) -> StorageEngine:
        return self._storage_engine

    def _select(self, type_: Union[str, Type] = None, **kwargs):
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
            'meta_tree': self.storage_engine.tree('meta', None, read_only=True),
            'query_cache': defaultdict(dict),
        }

        if isinstance(type_, str):
            cont_type = Container.registry.get(type_)
            seq_type = Sequence.registry.get(type_)
            if cont_type is not None and seq_type is not None:
                raise AmbiguousQueryTypeError(type_)

            if cont_type is None and seq_type is None:
                raise UnknownQueryTypeError(type_)

            orig_type = cont_type if cont_type is not None else seq_type
            type_ = orig_type
        else:
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
        return self._select(type_).filter(q) if q else self._select(type_)

    def sequences(self,
                  query_: Optional[str] = None,
                  type_: Union[str, Type[Sequence]] = Sequence,
                  **kwargs) -> SequenceCollection:
        q = construct_query_expression('sequence', query_, **kwargs)
        return self._select(type_).filter(q) if q else self._select(type_)
