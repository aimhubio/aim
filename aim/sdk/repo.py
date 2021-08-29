import os
import shutil

from collections import defaultdict
from typing import Dict, Iterator, NamedTuple, Optional
from weakref import WeakValueDictionary

from aim.sdk.configs import AIM_REPO_NAME
from aim.sdk.run import Run
from aim.sdk.utils import search_aim_repo, clean_repo_path
from aim.sdk.trace import QueryRunTraceCollection, QueryTraceCollection

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
        if cls._default_path:
            repo_path = cls._default_path
        else:
            repo_path, found = search_aim_repo(os.path.curdir)
            if not found:
                repo_path = os.getcwd()

        return cls.from_path(repo_path, init=init)

    @classmethod
    def from_path(cls, path: str, read_only: bool = None, init: bool = False):
        path = clean_repo_path(path)
        repo = cls._pool.get(path)
        if repo is None:
            repo = Repo(path, read_only=read_only, init=init)
            cls._pool[path] = repo
        return repo

    @classmethod
    def exists(cls, path: str) -> bool:
        path = clean_repo_path(path)
        aim_repo_path = os.path.join(path, AIM_REPO_NAME)
        return os.path.exists(aim_repo_path)

    @classmethod
    def rm(cls, path: str):
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

    def iter_runs(self) -> Iterator["Run"]:
        self.meta_tree.preload()
        for run_name in self.meta_tree.view('chunks').keys():
            yield Run(run_name, repo=self, read_only=True)

    def get_run(self, hashname: str) -> Optional['Run']:
        # TODO: [MV] optimize existence check for run
        if hashname is None or hashname not in self.meta_tree.view('chunks').keys():
            return None
        else:
            return Run(hashname, repo=self, read_only=True)

    def query_runs(self, query: str = '') -> QueryRunTraceCollection:
        db = self.structured_db
        db.init_cache('runs_cache', db.runs, lambda run: run.hashname)
        Run.set_props_cache_hint('runs_cache')
        return QueryRunTraceCollection(self, query)

    def traces(self, query: str = '') -> QueryTraceCollection:
        db = self.structured_db
        db.init_cache('runs_cache', db.runs, lambda run: run.hashname)
        Run.set_props_cache_hint('runs_cache')
        return QueryTraceCollection(repo=self, query=query)

    def iter_traces(self, query: str = '') -> QueryTraceCollection:
        return self.traces(query=query)

    def get_meta_tree(self):
        return self.request(
            'meta', read_only=True, from_union=True
        ).tree().view('meta')

    def collect_metrics(self) -> Dict[str, list]:
        meta_tree = self.get_meta_tree()
        traces = meta_tree.collect('traces')
        metrics = defaultdict(list)
        for ctx_id, trace_metrics in traces.items():
            for metric in trace_metrics.keys():
                metrics[metric].append(meta_tree['contexts', ctx_id])

        return metrics

    def collect_params(self):
        meta_tree = self.get_meta_tree()
        return meta_tree.collect('attrs', strict=False)
