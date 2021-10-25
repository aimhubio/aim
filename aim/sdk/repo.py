import os
import shutil
from enum import Enum

from packaging import version
from collections import defaultdict
from typing import Dict, Iterator, NamedTuple, Optional
from weakref import WeakValueDictionary

from aim.ext.sshfs.utils import mount_remote_repo, unmount_remote_repo
from aim.ext.task_queue.queue import TaskQueue

from aim.sdk.configs import AIM_REPO_NAME, AIM_ENABLE_TRACKING_THREAD
from aim.sdk.run import Run
from aim.sdk.utils import search_aim_repo, clean_repo_path
from aim.sdk.sequence_collection import QuerySequenceCollection, QueryRunSequenceCollection
from aim.sdk.metric import Metric
from aim.sdk.data_version import DATA_VERSION

from aim.storage.container import Container
from aim.storage.rockscontainer import RocksContainer
from aim.storage.union import RocksUnionContainer

from aim.storage.structured.db import DB


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
    _default_path = None  # for unit-tests

    tracking_queue = _get_tracking_queue()

    def __init__(self, path: str, *, read_only: bool = None, init: bool = False):
        if read_only is not None:
            raise NotImplementedError
        self.read_only = read_only
        self._mount_root = None
        if path.startswith('ssh://'):
            self._mount_root, self.root_path = mount_remote_repo(path)
        else:
            self.root_path = path
        self.path = os.path.join(self.root_path, AIM_REPO_NAME)

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
        if init:
            self.structured_db.run_upgrades()

    @property
    def meta_tree(self):
        return self.request('meta', read_only=True, from_union=True).tree().view('meta')

    def __repr__(self) -> str:
        return f'<Repo#{hash(self)} path={self.path} read_only={self.read_only}>'

    def __hash__(self) -> int:
        return hash(self.path)

    def __eq__(self, o: 'Repo') -> bool:
        return self.path == o.path

    @staticmethod
    def set_default_path(path: str):
        Repo._default_path = path

    @classmethod
    def default_repo_path(cls) -> str:
        if cls._default_path:
            repo_path = cls._default_path
        else:
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
        aim_repo_path = os.path.join(path, AIM_REPO_NAME)
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
        aim_repo_path = os.path.join(path, AIM_REPO_NAME)
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
        version_file_path = os.path.join(path, '.aim', 'VERSION')
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
        for run_name in self.meta_tree.view('chunks').keys():
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
        if run_hash is None or run_hash not in self.meta_tree.view('chunks').keys():
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
            :obj:`MetricCollection`: Iterable for runs/metrics matching query expression.
        """
        db = self.structured_db
        cache_name = 'runs_cache'
        db.invalidate_cache(cache_name)
        db.init_cache(cache_name, db.runs, lambda run: run.hash)
        self.run_props_cache_hint = cache_name
        return QueryRunSequenceCollection(self, Metric, query, paginated, offset)

    @property
    def run_props_cache_hint(self):
        return self._run_props_cache_hint

    @run_props_cache_hint.setter
    def run_props_cache_hint(self, cache: str):
        self._run_props_cache_hint = cache

    def query_metrics(self, query: str = '') -> QuerySequenceCollection:
        """Get metrics satisfying query expression.

        Args:
             query (str): query expression.
        Returns:
            :obj:`MetricCollection`: Iterable for metrics matching query expression.
        """
        db = self.structured_db
        cache_name = 'runs_cache'
        db.invalidate_cache(cache_name)
        db.init_cache(cache_name, db.runs, lambda run: run.hash)
        self.run_props_cache_hint = cache_name

        return QuerySequenceCollection(repo=self, seq_cls=Metric, query=query)

    def _get_meta_tree(self):
        return self.request(
            'meta', read_only=True, from_union=True
        ).tree().view('meta')

    def collect_metrics_info(self) -> Dict[str, list]:
        """Utility function for getting metric names and contexts for all runs.

        Returns:
            :obj:`dict`: Tree of metrics and their contexts.
        """
        meta_tree = self._get_meta_tree()
        try:
            traces = meta_tree.collect('traces')
        except KeyError:
            traces = {}
        metrics = defaultdict(list)
        for ctx_id, trace_metrics in traces.items():
            for metric in trace_metrics.keys():
                metrics[metric].append(meta_tree['contexts', ctx_id])

        return metrics

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

    def __del__(self):
        if self._mount_root:
            unmount_remote_repo(self.root_path, self._mount_root)
