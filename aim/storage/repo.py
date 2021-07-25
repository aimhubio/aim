
from functools import lru_cache
from glob import glob
import os
from time import time

from typing import Dict, Iterable, Iterator, List, NamedTuple, TYPE_CHECKING, Tuple
from weakref import WeakValueDictionary

from aim.storage.container import Container
from aim.storage.containerview import ContainerView
from aim.storage.singlecontainerview import SingleContainerView
from aim.storage.trace import TraceCollection
from aim.storage.trace import QueryRunTraceCollection, QueryTraceCollection

from aim.storage.run import Run


class ContainerConfig(NamedTuple):
    name: str
    read_only: bool


# TODO make this api thread-safe
class Repo:

    _pool = WeakValueDictionary()  # TODO: take read only into account

    def __init__(
        self,
        path: str,
        *,
        read_only: bool = None
    ):
        if read_only is not None:
            raise NotImplementedError
        self.read_only = read_only
        self.path = path
        self.container_pool: Dict[ContainerConfig, Container] = WeakValueDictionary()
        self.persistent_pool: Dict[ContainerConfig, Container] = dict()
        self.container_view_pool: Dict[ContainerConfig, ContainerView] = WeakValueDictionary()

        self._runs_in_progress_cache: List[str] = None
        self._runs_in_progress_checked = None
        os.makedirs(self.path, exist_ok=True)
        os.makedirs(os.path.join(self.path, 'runs'), exist_ok=True)
        os.makedirs(os.path.join(self.path, 'locks'), exist_ok=True)
        os.makedirs(os.path.join(self.path, 'progress'), exist_ok=True)

    def runs_in_progress(
        self
    ) -> Iterable[str]:
        now = time()
        if (
            self._runs_in_progress_checked is not None
            and
            (now - self._runs_in_progress_checked) < 0.2
        ):
            return self._runs_in_progress_cache

        self._runs_in_progress_checked = now

        def run_name_from_path(path):

            path, _, _progress = path.rpartition('.progres')
            if not path:
                path = _progress

            _, _, path = path.partition(self.path)
            _, _, path = path.partition('/progress/')
            # path, _, _ = path.rpartition('.db.prog ress')
            path, _, _db = path.rpartition('.')
            assert _db == "db"
            path, _, _ty = path.rpartition('.')
            assert _ty in ["meta", "series"]
            return path

        self._runs_in_progress_cache = set(
            run_name_from_path(path) for path in
            glob(f'{self.path}/progress/*')
        )
        return list(self._runs_in_progress_cache)

    def __repr__(self) -> str:
        return f'<Repo#{hash(self)} path={self.path} read_only={self.read_only}>'

    def __hash__(self) -> int:
        return hash(self.path)

    def __eq__(self, o: 'Repo') -> bool:
        return self.path == o.path

    @classmethod
    def default_repo(
        cls
    ):
        return cls.from_path('.aim')

    @classmethod
    def from_path(
        cls, path: str,
        read_only: bool = None
    ):
        repo = cls._pool.get(path)
        if repo is None:
            repo = Repo(path, read_only=read_only)
            cls._pool[path] = repo
        return repo

    def get_container(
        self,
        name: str,
        read_only: bool
    ) -> Container:
        if self.read_only and not read_only:
            raise ValueError('Repo is read-only')

        container_config = ContainerConfig(name, read_only)
        container = self.container_pool.get(container_config)
        if container is None:
            path = os.path.join(self.path, f'{name}.db')
            container = Container(path, read_only=read_only)
            if 'UNION' in name:
                self.persistent_pool[container_config] = container
            self.container_pool[container_config] = container

        return container

    def view(
        self,
        name: str,
        *,
        read_only: bool,
        from_union: bool = False
    ):
        if not read_only:
            from_union = False

        container_config = ContainerConfig(name, read_only)
        container_view = self.container_view_pool.get(container_config)
        if container_view is None:
            container = self.get_container(name if not from_union else "runs/UNION." + name.rpartition('.')[-1]
                                           , read_only=read_only)
            container_view = SingleContainerView(container=container, read_only=read_only)
            self.container_view_pool[container_config] = container_view

        return container_view

    def iter_runs(
        self,
        from_union: bool = False
    ) -> Iterator['Run']:
        for run_name in self.runs_in_progress():
            yield Run(run_name, repo=self, read_only=True, from_union=from_union)

    def query_runs(
        self,
        query: str = ''
    ) -> QueryRunTraceCollection:
        return QueryRunTraceCollection(self, query)

    def traces(
        self,
        query: str = ''
    ):
        return QueryTraceCollection(repo=self, query=query)

    def iter_traces(
        self,
        query: str = ''
    ):
        return self.traces(query=query)

    def meta_tree(
        self
    ):
        meta_tree = self.view(f'runs/dummy_hash.meta',
                              read_only=True,
                              from_union=True)
        return meta_tree.view(b'M\xfe').tree()
