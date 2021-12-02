import os
import shutil
import logging
from enum import Enum

from packaging import version
from collections import defaultdict
from typing import Dict, Tuple, Iterator, NamedTuple, Optional
from weakref import WeakValueDictionary

from aim.ext.sshfs.utils import mount_remote_repo, unmount_remote_repo
from aim.ext.task_queue.queue import TaskQueue
from aim.ext.cleanup import AutoClean

from aim.sdk.configs import get_aim_repo_name, AIM_ENABLE_TRACKING_THREAD
from aim.sdk.run import Run
from aim.sdk.utils import search_aim_repo, clean_repo_path
from aim.sdk.sequence_collection import QuerySequenceCollection, QueryRunSequenceCollection
from aim.sdk.sequence import Sequence
from aim.sdk.data_version import DATA_VERSION

from aim.storage.container import Container
from aim.storage.rockscontainer import RocksContainer
from aim.storage.union import RocksUnionContainer

from aim.storage.structured.db import DB

logger = logging.getLogger(__name__)


class ContainerConfig(NamedTuple):
    name: str
    sub: Optional[str]
    read_only: bool


class RepoStatus(Enum):
    MISSING = 1
    UPDATE_REQUIRED = 2
    PATCH_REQUIRED = 3
    UPDATED = 4


def _get_tracking_queue():
    if os.getenv(AIM_ENABLE_TRACKING_THREAD, False):
        return TaskQueue('metric_tracking', max_backlog=10_000_000)  # single thread task queue for Run.track
    return None


class RepoAutoClean(AutoClean):
    PRIORITY = 30

    def __init__(self, instance: 'Repo') -> None:
        """
        Prepare the `Repo` for automatic cleanup.

        Args:
            instance: The `Repo` instance to be cleaned up.
        """
        super().__init__(instance)
        self.root_path = instance.root_path
        self._mount_root = instance._mount_root

    def _close(self) -> None:
        """Close the `Repo` and unmount the remote repository."""
        if self._mount_root:
            logger.debug(f'Unmounting remote repository at {self._mount_root}')
            unmount_remote_repo(self.root_path, self._mount_root)


# TODO make this api thread-safe
class Repo:
    """Aim repository object.

    Provides methods for  repositories creation/opening/cleanup.
    Provides APIs for accessing Runs.
    Provides API for querying Runs/Metrics based on a given expression.

    Args:
        path (str): Path to Aim repository.
        read_only (:obj:`bool`, optional): Flag for opening Repo in readonly mode. False by default.
        init (:obj:`bool`, optional): Flag used to initialize new Repo. False by default.
            Recommended to use ``aim init`` command instead.
    """
    _pool = WeakValueDictionary()  # TODO: take read only into account

    tracking_queue = _get_tracking_queue()

    def __init__(self, path: str, *, read_only: bool = None, init: bool = False):
        if read_only is not None:
            raise NotImplementedError

        self._resources = None
        self.read_only = read_only
        self._mount_root = None
        if path.startswith('ssh://'):
            self._mount_root, self.root_path = mount_remote_repo(path)
        else:
            self.root_path = path
        self.path = os.path.join(self.root_path, get_aim_repo_name())

        if init:
            os.makedirs(self.path, exist_ok=True)
            with open(os.path.join(self.path, 'VERSION'), 'w') as version_fh:
                version_fh.write(DATA_VERSION + '\n')
        if not os.path.exists(self.path):
            if self._mount_root:
                unmount_remote_repo(self.root_path, self._mount_root)
            raise RuntimeError(f'Cannot find repository \'{self.path}\'. Please init first.')

        self.container_pool: Dict[ContainerConfig, Container] = WeakValueDictionary()
        self.persistent_pool: Dict[ContainerConfig, Container] = dict()
        self.container_view_pool: Dict[ContainerConfig, Container] = WeakValueDictionary()

        self.structured_db = DB.from_path(self.path)
        self._run_props_cache_hint = None
        self._encryption_key = None
        if init:
            self.structured_db.run_upgrades()

        self._resources = RepoAutoClean(self)

    @property
    def meta_tree(self):
        return self.request('meta', read_only=True, from_union=True).tree().subtree('meta')

    def __repr__(self) -> str:
        return f'<Repo#{hash(self)} path={self.path} read_only={self.read_only}>'

    def __hash__(self) -> int:
        return hash(self.path)

    def __eq__(self, o: 'Repo') -> bool:
        return self.path == o.path

    @classmethod
    def default_repo_path(cls) -> str:
        repo_path, found = search_aim_repo(os.path.curdir)
        if not found:
            repo_path = os.getcwd()
        return repo_path

    @classmethod
    def default_repo(cls, init: bool = False):
        """Named constructor for default repository.

        Searches nearest `.aim` directory from current directory to roo directory.
        If not found, return Repo for current directory.

        Args:
            init (:obj:`bool`, optional): Flag used to initialize new Repo. False by default.
                Recommended to use `aim init` command instead.
        Returns:
            :obj:`Repo` object.
        """
        return cls.from_path(cls.default_repo_path(), init=init)

    @classmethod
    def from_path(cls, path: str, read_only: bool = None, init: bool = False):
        """Named constructor for Repo for given path.

        Arguments:
            path (str): Path to Aim repository.
            read_only (:obj:`bool`, optional): Flag for opening Repo in readonly mode. False by default.
            init (:obj:`bool`, optional): Flag used to initialize new Repo. False by default.
                Recommended to use ``aim init`` command instead.
        Returns:
            :obj:`Repo` object.
        """
        if not path.startswith('ssh://'):
            path = clean_repo_path(path)
        repo = cls._pool.get(path)
        if repo is None:
            repo = Repo(path, read_only=read_only, init=init)
            cls._pool[path] = repo
        return repo

    @classmethod
    def exists(cls, path: str) -> bool:
        """Check Aim repository existence.

        Args:
            path (str): Path to Aim repository.
        Returns:
            True if repository exists, False otherwise.
        """
        path = clean_repo_path(path)
        aim_repo_path = os.path.join(path, get_aim_repo_name())
        return os.path.exists(aim_repo_path)

    @classmethod
    def rm(cls, path: str):
        """Remove Aim repository.

        Args:
            path (str): Path to Aim repository.
        """
        path = clean_repo_path(path)
        repo = cls._pool.get(path)
        if repo is not None:
            del cls._pool[path]
        aim_repo_path = os.path.join(path, get_aim_repo_name())
        shutil.rmtree(aim_repo_path)

    @classmethod
    def check_repo_status(cls, path: str) -> RepoStatus:
        if not cls.exists(path):
            return RepoStatus.MISSING
        repo_version = version.parse(cls.get_version(path))
        current_version = version.parse(DATA_VERSION)
        if repo_version.major < current_version.major:
            return RepoStatus.UPDATE_REQUIRED
        if repo_version.minor < current_version.minor:
            return RepoStatus.PATCH_REQUIRED
        return RepoStatus.UPDATED

    @classmethod
    def get_version(cls, path: str):
        path = clean_repo_path(path)
        version_file_path = os.path.join(path, get_aim_repo_name(), 'VERSION')
        if os.path.exists(version_file_path):
            with open(version_file_path, 'r') as version_fh:
                return version_fh.read()
        return '0.0'  # old Aim repos

    def _get_container(
        self, name: str, read_only: bool, from_union: bool = False
    ) -> Container:
        if self.read_only and not read_only:
            raise ValueError('Repo is read-only')

        container_config = ContainerConfig(name, None, read_only=read_only)
        container = self.container_pool.get(container_config)
        if container is None:
            path = os.path.join(self.path, name)
            if from_union:
                container = RocksUnionContainer(path, read_only=read_only)
                self.persistent_pool[container_config] = container
            else:
                container = RocksContainer(path, read_only=read_only)
            self.container_pool[container_config] = container

        return container

    def request(
        self,
        name: str,
        sub: str = None,
        *,
        read_only: bool,
        from_union: bool = False  # TODO maybe = True by default
    ):

        container_config = ContainerConfig(name, sub, read_only)
        container_view = self.container_view_pool.get(container_config)
        if container_view is None:
            if read_only:
                if from_union:
                    path = name
                else:
                    assert sub is not None
                    path = os.path.join(name, 'chunks', sub)
                container = self._get_container(path, read_only=True, from_union=from_union)
            else:
                assert sub is not None
                path = os.path.join(name, 'chunks', sub)
                container = self._get_container(path, read_only=False, from_union=False)

            container_view = container
            self.container_view_pool[container_config] = container_view

        return container_view

    def iter_runs(self) -> Iterator['Run']:
        """Iterate over Repo runs.

        Yields:
            next :obj:`Run` in readonly mode .
        """
        self.meta_tree.preload()
        for run_name in self.meta_tree.subtree('chunks').keys():
            yield Run(run_name, repo=self, read_only=True)

    def iter_runs_from_cache(self, offset: str = None) -> Iterator['Run']:
        db = self.structured_db
        cache = db.caches.get('runs_cache')
        if cache:
            run_names = cache.keys()
            try:
                offset_idx = run_names.index(offset) + 1
            except ValueError:
                offset_idx = 0
            for run_name in run_names[offset_idx:]:
                yield Run(run_name, repo=self, read_only=True)
        else:
            raise StopIteration

    def get_run(self, run_hash: str) -> Optional['Run']:
        """Get run if exists.

        Args:
            run_hash (str): Run hash.
        Returns:
            :obj:`Run` object if hash is found in repository. `None` otherwise.
        """
        # TODO: [MV] optimize existence check for run
        if run_hash is None or run_hash not in self.meta_tree.subtree('chunks').keys():
            return None
        else:
            return Run(run_hash, repo=self, read_only=True)

    def query_runs(self, query: str = '', paginated: bool = False, offset: str = None) -> QueryRunSequenceCollection:
        """Get runs satisfying query expression.

        Args:
             query (:obj:`str`, optional): query expression.
                If not specified, query results will include all runs.
             paginated (:obj:`bool`, optional): query results pagination flag. False if not specified.
             offset (:obj:`str`, optional): `hash` of Run to skip to.
        Returns:
            :obj:`SequenceCollection`: Iterable for runs/metrics matching query expression.
        """
        self._prepare_runs_cache()
        return QueryRunSequenceCollection(self, Sequence, query, paginated, offset)

    def query_metrics(self, query: str = '') -> QuerySequenceCollection:
        """Get metrics satisfying query expression.

        Args:
             query (str): query expression.
        Returns:
            :obj:`MetricCollection`: Iterable for metrics matching query expression.
        """
        self._prepare_runs_cache()
        from aim.sdk.metric import Metric
        return QuerySequenceCollection(repo=self, seq_cls=Metric, query=query)

    def query_images(self, query: str = '') -> QuerySequenceCollection:
        """Get image collections satisfying query expression.

        Args:
             query (str): query expression.
        Returns:
            :obj:`SequenceCollection`: Iterable for image sequences matching query expression.
        """
        self._prepare_runs_cache()
        from aim.sdk.image_sequence import Images
        return QuerySequenceCollection(repo=self, seq_cls=Images, query=query)

    def query_distributions(self, query: str = '') -> QuerySequenceCollection:
        """Get distribution collections satisfying query expression.

        Args:
             query (str): query expression.
        Returns:
            :obj:`SequenceCollection`: Iterable for distribution sequences matching query expression.
        """
        self._prepare_runs_cache()
        from aim.sdk.distribution_sequence import Distributions
        return QuerySequenceCollection(repo=self, seq_cls=Distributions, query=query)

    @property
    def run_props_cache_hint(self):
        return self._run_props_cache_hint

    @run_props_cache_hint.setter
    def run_props_cache_hint(self, cache: str):
        self._run_props_cache_hint = cache

    @property
    def encryption_key(self):
        from cryptography.fernet import Fernet

        if self._encryption_key:
            return self._encryption_key

        encryption_key_path = os.path.join(self.path, 'ENCRYPTION_KEY')
        if not os.path.exists(encryption_key_path):
            with open(encryption_key_path, 'w') as key_fp:
                encryption_key = Fernet.generate_key().decode()
                key_fp.write(encryption_key + '\n')
        else:
            with open(encryption_key_path, 'r') as key_fp:
                encryption_key = key_fp.readline()

        self._encryption_key = encryption_key

        return encryption_key

    def _get_meta_tree(self):
        return self.request(
            'meta', read_only=True, from_union=True
        ).tree().subtree('meta')

    @staticmethod
    def available_sequence_types():
        return Sequence.registry.keys()

    @staticmethod
    def validate_sequence_types(sequence_types: Tuple[str, ...]):
        for seq_name in sequence_types:
            seq_cls = Sequence.registry.get(seq_name, None)
            if seq_cls is None or not issubclass(seq_cls, Sequence):
                raise ValueError(f'\'{seq_name}\' is not a valid Sequence')

    def collect_sequence_info(self, sequence_types: Tuple[str, ...]) -> Dict[str, Dict[str, list]]:
        """Utility function for getting sequence names and contexts for all runs by given sequence types.

        Args:
            sequence_types (:obj:`tuple[str]`, optional): Sequence types to get tracked sequence names/contexts for.
            Defaults to 'metric'.

        Returns:
            :obj:`dict`: Tree of sequences and their contexts groupped by sequence type.
        """
        meta_tree = self._get_meta_tree()
        sequence_traces = {}
        if isinstance(sequence_types, str):
            sequence_types = (sequence_types,)
        for seq_type in sequence_types:
            seq_cls = Sequence.registry.get(seq_type, None)
            if seq_cls is None:
                raise ValueError(f'\'{seq_type}\' is not a valid Sequence')
            assert issubclass(seq_cls, Sequence)
            dtypes = seq_cls.allowed_dtypes()
            dtype_traces = set()
            for dtype in dtypes:
                try:
                    dtype_trace_tree = meta_tree.collect(('traces_types', dtype))
                    for ctx_id, seqs in dtype_trace_tree.items():
                        for seq_name in seqs.keys():
                            dtype_traces.add((ctx_id, seq_name))
                except KeyError:
                    pass
            if 'float' in dtypes:  # old sequences without dtype set are considered float sequences
                try:
                    dtype_trace_tree = meta_tree.collect('traces')
                    for ctx_id, seqs in dtype_trace_tree.items():
                        for seq_name in seqs.keys():
                            dtype_traces.add((ctx_id, seq_name))
                except KeyError:
                    pass
            traces_info = defaultdict(list)
            for ctx_id, seq_name in dtype_traces:
                traces_info[seq_name].append(meta_tree['contexts', ctx_id])
            sequence_traces[seq_type] = traces_info
        return sequence_traces

    def collect_params_info(self) -> dict:
        """Utility function for getting run meta-parameters.

        Returns:
            :obj:`dict`: All runs meta-parameters.
        """
        meta_tree = self._get_meta_tree()
        try:
            return meta_tree.collect('attrs', strict=False)
        except KeyError:
            return {}

    def _prepare_runs_cache(self):
        db = self.structured_db
        cache_name = 'runs_cache'
        db.invalidate_cache(cache_name)
        db.init_cache(cache_name, db.runs, lambda run: run.hash)
        self.run_props_cache_hint = cache_name

    def close(self):
        if self._resources is None:
            return
        self._resources.close()
