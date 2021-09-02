import os
import shutil

from collections import defaultdict
from typing import Dict, Iterator, NamedTuple, Optional
from weakref import WeakValueDictionary

from aim.sdk.configs import AIM_REPO_NAME
from aim.sdk.run import Run
from aim.sdk.utils import search_aim_repo, clean_repo_path
from aim.sdk.metric import QueryRunMetricCollection, QueryMetricCollection

from aim.storage.union import UnionContainer
from aim.storage.container import Container
from aim.storage.containerview import ContainerView

from aim.storage.structured.db import DB


class ContainerConfig(NamedTuple):
    name: str
    sub: Optional[str]
    read_only: bool


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

    def __init__(self, path: str, *, read_only: bool = None, init: bool = False):
        if read_only is not None:
            raise NotImplementedError
        self.read_only = read_only
        self.root_path = path
        self.path = os.path.join(path, AIM_REPO_NAME)
        if init:
            os.makedirs(self.path, exist_ok=True)
        if not os.path.exists(self.path):
            raise RuntimeError(f'Cannot find database \'{path}\'. Please init first.')

        self.container_pool: Dict[ContainerConfig, Container] = WeakValueDictionary()
        self.persistent_pool: Dict[ContainerConfig, Container] = dict()
        self.container_view_pool: Dict[ContainerConfig, ContainerView] = WeakValueDictionary()

        self.structured_db = DB.from_path(self.path)

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
        if cls._default_path:
            repo_path = cls._default_path
        else:
            repo_path, found = search_aim_repo(os.path.curdir)
            if not found:
                repo_path = os.getcwd()

        return cls.from_path(repo_path, init=init)

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
                container = UnionContainer(path, read_only=read_only)
                self.persistent_pool[container_config] = container
            else:
                container = Container(path, read_only=read_only)
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

    def get_run(self, hashname: str) -> Optional['Run']:
        """Get run if exists.

        Args:
            hashname (str): Run hashname.
        Returns:
            :obj:`Run` object if hashname is found in repository. `None` otherwise.
        """
        # TODO: [MV] optimize existence check for run
        if hashname is None or hashname not in self.meta_tree.view('chunks').keys():
            return None
        else:
            return Run(hashname, repo=self, read_only=True)

    def query_runs(self, query: str = '', paginated: bool = False, offset: str = None) -> QueryRunMetricCollection:
        """Get runs satisfying query expression.

        Args:
             query (:obj:`str`, optional): query expression.
                If not specified, query results will include all runs.
             paginated (:obj:`bool`, optional): query results pagination flag. False if not specified.
             offset (:obj:`str`, optional): `hashname` of Run to skip to.
        Returns:
            :obj:`MetricCollection`: Iterable for runs/metrics matching query expression.
        """
        db = self.structured_db
        db.init_cache('runs_cache', db.runs, lambda run: run.hashname)
        Run.set_props_cache_hint('runs_cache')
        return QueryRunMetricCollection(self, query, paginated, offset)

    def query_metrics(self, query: str = '') -> QueryMetricCollection:
        """Get metrics satisfying query expression.

        Args:
             query (str): query expression.
        Returns:
            :obj:`MetricCollection`: Iterable for metrics matching query expression.
        """
        db = self.structured_db
        db.init_cache('runs_cache', db.runs, lambda run: run.hashname)
        Run.set_props_cache_hint('runs_cache')
        return QueryMetricCollection(repo=self, query=query)

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
        traces = meta_tree.collect('traces')
        metrics = defaultdict(list)
        for ctx_id, trace_metrics in traces.items():
            for metric in trace_metrics.keys():
                metrics[metric].append(meta_tree['contexts', ctx_id])

        return metrics

    def collect_params_info(self):
        """Utility function for getting run meta-parameters.

        Returns:
            :obj:`dict`: All runs meta-parameters.
        """
        meta_tree = self._get_meta_tree()
        return meta_tree.collect('attrs', strict=False)
