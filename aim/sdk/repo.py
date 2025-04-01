import logging
import os
import shutil

from collections import defaultdict
from contextlib import contextmanager
from enum import Enum
from typing import TYPE_CHECKING, Dict, Iterator, List, NamedTuple, Optional, Set, Tuple
from weakref import WeakValueDictionary

from aim.ext.cleanup import AutoClean
from aim.ext.sshfs.utils import mount_remote_repo, unmount_remote_repo
from aim.ext.task_queue.queue import TaskQueue
from aim.ext.transport.client import Client
from aim.sdk.configs import AIM_ENABLE_TRACKING_THREAD, get_aim_repo_name
from aim.sdk.data_version import DATA_VERSION
from aim.sdk.errors import RepoIntegrityError
from aim.sdk.lock_manager import LockManager, RunLock
from aim.sdk.remote_repo_proxy import RemoteRepoProxy
from aim.sdk.run import Run
from aim.sdk.sequence import Sequence
from aim.sdk.sequence_collection import (
    QueryRunSequenceCollection,
    QuerySequenceCollection,
)
from aim.sdk.types import QueryReportMode
from aim.sdk.utils import clean_repo_path, search_aim_repo
from aim.storage.container import Container
from aim.storage.lock_proxy import ProxyLock
from aim.storage.locking import SoftFileLock
from aim.storage.rockscontainer import RocksContainer
from aim.storage.structured.db import DB
from aim.storage.structured.proxy import StructuredRunProxy
from aim.storage.treeviewproxy import ProxyTree
from aim.storage.union import RocksUnionContainer
from cachetools.func import ttl_cache


if TYPE_CHECKING:
    from datetime import datetime

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
        self._client = instance._client
        self._mount_root = instance._mount_root

    def _close(self) -> None:
        """Close the `Repo` and unmount the remote repository."""
        if self._client:
            self._client._heartbeat_sender.stop()
            self._client.get_queue().wait_for_finish()
            self._client.get_queue().stop()
            self._client.disconnect()
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
        path (:obj:`str`): Path to Aim repository.
        read_only (:obj:`bool`, optional): Flag for opening Repo in readonly mode. False by default.
        init (:obj:`bool`, optional): Flag used to initialize new Repo. False by default.
            Recommended to use ``aim init`` command instead.
    """

    _pool = WeakValueDictionary()  # TODO: take read only into account

    tracking_queue = _get_tracking_queue()

    def __init__(self, path: str, *, read_only: Optional[bool] = None, init: Optional[bool] = False):
        if read_only is not None:
            raise NotImplementedError

        self._resources = None
        self.read_only = read_only
        self._mount_root = None
        self._client: Client = None
        self._lock_manager: LockManager = None
        if path.startswith('ssh://'):
            self._mount_root, self.root_path = mount_remote_repo(path)
        elif self.is_remote_path(path):
            remote_path = path.replace('aim://', '')
            self._client = Client(remote_path)
            self._remote_repo_proxy = RemoteRepoProxy(self._client)
            self.root_path = remote_path
        else:
            self.root_path = path
        self.path = os.path.join(self.root_path, get_aim_repo_name())

        if init:
            os.makedirs(self.path, exist_ok=True)
            os.makedirs(os.path.join(self.path, 'locks'), exist_ok=True)
        if not self.is_remote_repo and not os.path.exists(self.path):
            if self._mount_root:
                unmount_remote_repo(self.root_path, self._mount_root)
            raise RuntimeError(f"Cannot find repository '{self.path}'. Please init first.")

        self.container_pool: Dict[ContainerConfig, Container] = WeakValueDictionary()
        self.persistent_pool: Dict[ContainerConfig, Container] = dict()
        self.container_view_pool: Dict[ContainerConfig, Container] = WeakValueDictionary()

        self._run_props_cache_hint = None
        self._encryption_key = None
        self.structured_db = None

        if not self.is_remote_repo:
            self._lock_manager = LockManager(self.path)
            self._sdb_lock_path = os.path.join(self.path, 'locks', 'structured_db_lock')
            self._sdb_lock = SoftFileLock(self._sdb_lock_path, timeout=5 * 60)  # timeout after 5 minutes

            status = self.check_repo_status(self.root_path)
            self.structured_db = DB.from_path(self.path)
            if init or status == RepoStatus.PATCH_REQUIRED:
                with self._sdb_lock:
                    self.structured_db.run_upgrades()
                    with open(os.path.join(self.path, 'VERSION'), 'w') as version_fh:
                        version_fh.write('.'.join(map(str, DATA_VERSION)) + '\n')

        self._resources = RepoAutoClean(self)

    @property
    def meta_tree(self):
        return self.request_tree('meta', read_only=True, from_union=True).subtree('meta')

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
            path (:obj:`str`): Path to Aim repository.
            read_only (:obj:`bool`, optional): Flag for opening Repo in readonly mode. False by default.
            init (:obj:`bool`, optional): Flag used to initialize new Repo. False by default.
                Recommended to use ``aim init`` command instead.
        Returns:
            :obj:`Repo` object.
        """
        if not path.startswith('ssh://') and not cls.is_remote_path(path):
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
            path (:obj:`str`): Path to Aim repository.
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
            path (:obj:`str`): Path to Aim repository.
        """
        path = clean_repo_path(path)
        repo = cls._pool.get(path)
        if repo is not None:
            del cls._pool[path]
        aim_repo_path = os.path.join(path, get_aim_repo_name())
        shutil.rmtree(aim_repo_path)

    @classmethod
    def check_repo_status(cls, path: str) -> RepoStatus:
        if cls.is_remote_path(path):
            return RepoStatus.UPDATED
        if not cls.exists(path):
            return RepoStatus.MISSING
        repo_version = cls.get_version(path)
        current_version = DATA_VERSION
        if repo_version < current_version:
            if repo_version[0] < current_version[0]:
                return RepoStatus.UPDATE_REQUIRED
            else:
                return RepoStatus.PATCH_REQUIRED
        return RepoStatus.UPDATED

    @classmethod
    def get_version(cls, path: str):
        path = clean_repo_path(path)
        version_file_path = os.path.join(path, get_aim_repo_name(), 'VERSION')
        if os.path.exists(version_file_path):
            with open(version_file_path, 'r') as version_fh:
                version_tp = version_fh.read().strip().split('.')
                return tuple(map(int, version_tp))
        return 0, 0  # old Aim repos

    @classmethod
    def is_remote_path(cls, path: str):
        return path.startswith('aim://')

    def _get_container(
        self, name: str, read_only: bool, from_union: bool = False, skip_read_optimization: bool = False
    ) -> Container:
        # TODO [AT]: refactor get container/tree logic to make it more simple
        if self.read_only and not read_only:
            raise ValueError('Repo is read-only')

        container_config = ContainerConfig(name, None, read_only=read_only)
        container = self.container_pool.get(container_config)
        if container is None:
            if from_union:
                # Temporarily use index db when getting data from union.
                path = os.path.join(self.path, name, 'index')
                container = RocksContainer(path, read_only=read_only, skip_read_optimization=skip_read_optimization)
                self.persistent_pool[container_config] = container
            else:
                path = os.path.join(self.path, name)
                container = RocksContainer(path, read_only=read_only, skip_read_optimization=skip_read_optimization)
            self.container_pool[container_config] = container

        return container

    def _get_index_tree(self, name: str, timeout: int):
        if not self.is_remote_repo:
            return self._get_index_container(name, timeout).tree()
        else:
            return ProxyTree(self._client, name, '', read_only=False, index=True, timeout=timeout)

    def _get_index_container(self, name: str, timeout: int) -> Container:
        if self.read_only:
            raise ValueError('Repo is read-only')

        name = name + '/index'
        container_config = ContainerConfig(name, None, read_only=True)
        container = self.container_pool.get(container_config)
        if container is None:
            path = os.path.join(self.path, name)
            container = RocksContainer(path, read_only=False, timeout=timeout)
            self.container_pool[container_config] = container

        return container

    def request_tree(
        self,
        name: str,
        sub: str = None,
        *,
        read_only: bool,
        from_union: bool = False,  # TODO maybe = True by default
        no_cache: bool = False,
        skip_read_optimization: bool = False,
    ):
        if not self.is_remote_repo:
            return self.request(
                name,
                sub,
                read_only=read_only,
                from_union=from_union,
                no_cache=no_cache,
                skip_read_optimization=skip_read_optimization,
            ).tree()
        else:
            return ProxyTree(self._client, name, sub, read_only=read_only, from_union=from_union, no_cache=no_cache)

    def request(
        self,
        name: str,
        sub: str = None,
        *,
        read_only: bool,
        from_union: bool = False,  # TODO maybe = True by default
        no_cache: bool = False,
        skip_read_optimization: bool = False,
    ):
        container_config = ContainerConfig(name, sub, read_only)
        container_view = self.container_view_pool.get(container_config)
        if container_view is None or no_cache:
            if read_only:
                if from_union:
                    path = name
                else:
                    assert sub is not None
                    path = os.path.join(name, 'chunks', sub)
                container = self._get_container(
                    path, read_only=True, from_union=from_union, skip_read_optimization=skip_read_optimization
                )
            else:
                assert sub is not None
                path = os.path.join(name, 'chunks', sub)
                container = self._get_container(path, read_only=False, from_union=False)

            container_view = container
            if not no_cache:
                self.container_view_pool[container_config] = container_view

        return container_view

    def request_props(self, hash_: str, read_only: bool, created_at: 'datetime' = None):
        if self.is_remote_repo:
            return StructuredRunProxy(self._client, hash_, read_only, created_at)

        assert self.structured_db
        _props = None

        if self.run_props_cache_hint:
            _props = self.structured_db.caches[self.run_props_cache_hint][hash_]
        if not _props:
            _props = self.structured_db.find_run(hash_)
            if not _props:
                if read_only:
                    raise RepoIntegrityError(f'Missing props for Run {hash_}')
                else:
                    with self._sdb_lock:
                        _props = self.structured_db.create_run(hash_, created_at)
            if self.run_props_cache_hint:
                self.structured_db.caches[self.run_props_cache_hint][hash_] = _props

        return _props

    def request_run_lock(self, hash_: str, timeout: int = 10) -> 'RunLock':
        if self.is_remote_repo:
            return ProxyLock(self._client, hash_)
        assert self._lock_manager
        return self._lock_manager.get_run_lock(hash_, timeout=timeout)

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

    def run_exists(self, run_hash: str) -> bool:
        return run_hash in self._all_run_hashes()

    def is_index_corrupted(self) -> bool:
        corruption_marker = os.path.join(self.path, 'meta', 'index', '.corrupted')
        return os.path.exists(corruption_marker)

    @ttl_cache(ttl=0.5)
    def _all_run_hashes(self) -> Set[str]:
        if self.is_remote_repo:
            return set(self._remote_repo_proxy.list_all_runs())
        else:
            chunks_dir = os.path.join(self.path, 'meta', 'chunks')
            if os.path.exists(chunks_dir):
                return set(os.listdir(chunks_dir))
            else:
                return set()

    def list_all_runs(self) -> List[str]:
        return list(self._all_run_hashes())

    def list_corrupted_runs(self) -> List[str]:
        from aim.storage.encoding import decode_path

        def get_run_hash_from_prefix(prefix: bytes):
            return decode_path(prefix)[-1]

        container = RocksUnionContainer(os.path.join(self.path, 'meta'), read_only=True)
        return list(map(get_run_hash_from_prefix, container.corrupted_dbs))

    def _active_run_hashes(self) -> Set[str]:
        if self.is_remote_repo:
            return set(self._remote_repo_proxy.list_active_runs())
        else:
            chunks_dir = os.path.join(self.path, 'meta', 'progress')
            if os.path.exists(chunks_dir):
                return set(os.listdir(chunks_dir))
            else:
                return set()

    def list_active_runs(self) -> List[str]:
        return list(self._active_run_hashes())

    def total_runs_count(self) -> int:
        db = self.structured_db
        if db:
            cache = db.caches.get('runs_cache')
        else:
            cache = None
        if cache:
            return len(cache.keys())
        else:
            self.meta_tree.preload()
            return len(list(self.meta_tree.subtree('chunks').keys()))

    def get_run(self, run_hash: str) -> Optional['Run']:
        """Get run if exists.

        Args:
            run_hash (:obj:`str`): Run hash.
        Returns:
            :obj:`Run` object if hash is found in repository. `None` otherwise.
        """
        # TODO: [MV] optimize existence check for run
        if run_hash is None or run_hash not in self.meta_tree.subtree('chunks').keys():
            return None
        else:
            return Run(run_hash, repo=self, read_only=True)

    def query_runs(
        self,
        query: str = '',
        paginated: bool = False,
        offset: str = None,
        report_mode: QueryReportMode = QueryReportMode.PROGRESS_BAR,
    ) -> QueryRunSequenceCollection:
        """Get runs satisfying query expression.

        Args:
             query (:obj:`str`, optional): query expression.
                If not specified, query results will include all runs.
             paginated (:obj:`bool`, optional): query results pagination flag. False if not specified.
             offset (:obj:`str`, optional): `hash` of Run to skip to.
             report_mode(:obj:`QueryReportMode`, optional): indicates report mode
                (0: DISABLED, 1: PROGRESS BAR, 2: PROGRESS TUPLE). QueryReportMode.PROGRESS_BAR if not specified.
        Returns:
            :obj:`SequenceCollection`: Iterable for runs/metrics matching query expression.
        """
        self._prepare_runs_cache()
        return QueryRunSequenceCollection(self, Sequence, query, paginated, offset, report_mode)

    def delete_run(self, run_hash: str) -> bool:
        """Delete Run data from aim repository

        This action removes run data permanently and cannot be reverted.
        If you want to archive run but keep it's data use `repo.get_run(run_hash).archived = True`.

        Args:
            run_hash (:obj:`str`): Run to be deleted.

        Returns:
            True if run deleted successfully, False otherwise.
        """
        try:
            self._delete_run(run_hash)
            return True
        except Exception as e:
            logger.warning(f"Error while trying to delete run '{run_hash}'. {str(e)}.")
            return False

    def delete_runs(self, run_hashes: List[str]) -> Tuple[bool, List[str]]:
        """Delete multiple Runs data from aim repository

        This action removes runs data permanently and cannot be reverted.
        If you want to archive run but keep it's data use `repo.get_run(run_hash).archived = True`.

        Args:
            run_hashes (:obj:`str`): list of Runs to be deleted.

        Returns:
            (True, []) if all runs deleted successfully, (False, :obj:`list`) with list of remaining runs otherwise.
        """
        remaining_runs = []
        for run_hash in run_hashes:
            try:
                self._delete_run(run_hash)
            except Exception as e:
                logger.warning(f"Error while trying to delete run '{run_hash}'. {str(e)}.")
                remaining_runs.append(run_hash)

        if remaining_runs:
            return False, remaining_runs
        else:
            return True, []

    def copy_runs(self, run_hashes: List[str], dest_repo: 'Repo') -> Tuple[bool, List[str]]:
        """Copy multiple Runs data from current aim repository to destination aim repository

        Args:
            run_hashes (:obj:`str`): list of Runs to be copied.
            dest_repo (:obj:`Repo`): destination Repo instance to copy Runs

        Returns:
            (True, []) if all runs were copied successfully,
            (False, :obj:`list`) with list of remaining runs otherwise.
        """
        from tqdm import tqdm

        remaining_runs = []
        for run_hash in tqdm(run_hashes):
            try:
                self._copy_run(run_hash, dest_repo)
            except Exception as e:
                logger.warning(f"Error while trying to copy run '{run_hash}'. {str(e)}.")
                remaining_runs.append(run_hash)

        if remaining_runs:
            return False, remaining_runs
        else:
            return True, []

    def move_runs(self, run_hashes: List[str], dest_repo: 'Repo') -> Tuple[bool, List[str]]:
        """Move multiple Runs data from current aim repository to destination aim repository

        Args:
            run_hashes (:obj:`str`): list of Runs to be moved.
            dest_repo (:obj:`Repo`): destination Repo instance to move Runs

        Returns:
            (True, []) if all runs were moved successfully,
            (False, :obj:`list`) with list of remaining runs otherwise.
        """
        from tqdm import tqdm

        remaining_runs = []
        for run_hash in tqdm(run_hashes):
            try:
                self._copy_run(run_hash, dest_repo)
                self._delete_run(run_hash)
            except Exception as e:
                logger.warning(f"Error while trying to move run '{run_hash}'. {str(e)}.")
                remaining_runs.append(run_hash)

        if remaining_runs:
            return False, remaining_runs
        else:
            return True, []

    def delete_experiment(self, exp_id: str) -> bool:
        """Delete Experiment data from aim repository

        This action removes experiment data permanently and cannot be reverted.
        If you want to archive experiment but keep it's data use `repo.get_experiment(exp_id).archived = True`.

        Args:
            exp_id (:obj:`str`): Experiment to be deleted.

        Returns:
            True if experiment and corresponding runs got deleted successfully, False otherwise.
        """
        try:
            self._delete_experiment(exp_id)
            return True
        except Exception as e:
            logger.warning(f"Error while trying to delete experiment '{exp_id}'. {str(e)}.")
            return False

    def query_metrics(
        self, query: str = '', report_mode: QueryReportMode = QueryReportMode.PROGRESS_BAR
    ) -> QuerySequenceCollection:
        """Get metrics satisfying query expression.

        Args:
             query (:obj:`str`): query expression.
             report_mode(:obj:`QueryReportMode`, optional): indicates report mode
                (0: DISABLED, 1: PROGRESS BAR, 2: PROGRESS TUPLE). QueryReportMode.PROGRESS_BAR if not specified.
        Returns:
            :obj:`SequenceCollection`: Iterable for metrics matching query expression.
        """
        self._prepare_runs_cache()
        from aim.sdk.sequences.metric import Metric

        return QuerySequenceCollection(repo=self, seq_cls=Metric, query=query, report_mode=report_mode)

    def query_images(
        self, query: str = '', report_mode: QueryReportMode = QueryReportMode.PROGRESS_BAR
    ) -> QuerySequenceCollection:
        """Get image collections satisfying query expression.

        Args:
             query (:obj:`str`): query expression.
             report_mode(:obj:`QueryReportMode`, optional): indicates report mode
                (0: DISABLED, 1: PROGRESS BAR, 2: PROGRESS TUPLE). QueryReportMode.PROGRESS_BAR if not specified.
        Returns:
            :obj:`SequenceCollection`: Iterable for image sequences matching query expression.
        """
        self._prepare_runs_cache()
        from aim.sdk.sequences.image_sequence import Images

        return QuerySequenceCollection(repo=self, seq_cls=Images, query=query, report_mode=report_mode)

    def query_audios(
        self, query: str = '', report_mode: QueryReportMode = QueryReportMode.PROGRESS_BAR
    ) -> QuerySequenceCollection:
        """Get audio collections satisfying query expression.

        Args:
             query (:obj:`str`): query expression.
             report_mode(:obj:`QueryReportMode`, optional): indicates report mode
                (0: DISABLED, 1: PROGRESS BAR, 2: PROGRESS TUPLE). QueryReportMode.PROGRESS_BAR if not specified.
        Returns:
            :obj:`SequenceCollection`: Iterable for audio sequences matching query expression.
        """
        self._prepare_runs_cache()
        from aim.sdk.sequences.audio_sequence import Audios

        return QuerySequenceCollection(repo=self, seq_cls=Audios, query=query, report_mode=report_mode)

    def query_figure_objects(
        self, query: str = '', report_mode: QueryReportMode = QueryReportMode.PROGRESS_BAR
    ) -> QuerySequenceCollection:
        """Get Figures collections satisfying query expression.

        Args:
             query (:obj:`str`): query expression.
             report_mode(:obj:`QueryReportMode`, optional): indicates report mode
                (0: DISABLED, 1: PROGRESS BAR, 2: PROGRESS TUPLE). QueryReportMode.PROGRESS_BAR if not specified.
        Returns:
            :obj:`SequenceCollection`: Iterable for Figure sequences matching query expression.
        """
        self._prepare_runs_cache()
        from aim.sdk.sequences.figure_sequence import Figures

        return QuerySequenceCollection(repo=self, seq_cls=Figures, query=query, report_mode=report_mode)

    def query_distributions(
        self, query: str = '', report_mode: QueryReportMode = QueryReportMode.PROGRESS_BAR
    ) -> QuerySequenceCollection:
        """Get distribution collections satisfying query expression.

        Args:
             query (:obj:`str`): query expression.
             report_mode(:obj:`QueryReportMode`, optional): indicates report mode
                (0: DISABLED, 1: PROGRESS BAR, 2: PROGRESS TUPLE). QueryReportMode.PROGRESS_BAR if not specified.
        Returns:
            :obj:`SequenceCollection`: Iterable for distribution sequences matching query expression.
        """
        self._prepare_runs_cache()
        from aim.sdk.sequences.distribution_sequence import Distributions

        return QuerySequenceCollection(repo=self, seq_cls=Distributions, query=query, report_mode=report_mode)

    def query_texts(
        self, query: str = '', report_mode: QueryReportMode = QueryReportMode.PROGRESS_BAR
    ) -> QuerySequenceCollection:
        """Get text collections satisfying query expression.

        Args:
             query (:obj:`str`): query expression.
             report_mode(:obj:`QueryReportMode`, optional): indicates report mode
                (0: DISABLED, 1: PROGRESS BAR, 2: PROGRESS TUPLE). QueryReportMode.PROGRESS_BAR if not specified.
        Returns:
            :obj:`SequenceCollection`: Iterable for text sequences matching query expression.
        """
        self._prepare_runs_cache()
        from aim.sdk.sequences.text_sequence import Texts

        return QuerySequenceCollection(repo=self, seq_cls=Texts, query=query, report_mode=report_mode)

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
        return self.request_tree('meta', read_only=True, from_union=True).subtree('meta')

    @staticmethod
    def available_sequence_types():
        return Sequence.registry.keys()

    @staticmethod
    def validate_sequence_types(sequence_types: Tuple[str, ...]):
        for seq_name in sequence_types:
            seq_cls = Sequence.registry.get(seq_name, None)
            if seq_cls is None or not issubclass(seq_cls, Sequence):
                raise ValueError(f"'{seq_name}' is not a valid Sequence")

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
                raise ValueError(f"'{seq_type}' is not a valid Sequence")
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

    def prune(self):
        """
        Utility function to remove dangling/orphan params/sequences with no referring runs.
        """
        from aim.sdk.utils import prune

        if self.is_remote_repo:
            self._remote_repo_proxy.prune()
        prune(self)

    def _prepare_runs_cache(self):
        if self.is_remote_repo:
            return

        db = self.structured_db
        cache_name = 'runs_cache'
        db.invalidate_cache(cache_name)
        db.init_cache(cache_name, db.runs, lambda run: run.hash)
        self.run_props_cache_hint = cache_name

    def _delete_experiment(self, exp_id):
        with self.structured_db:
            exp = self.structured_db.find_experiment(exp_id)
            # delete all runs locally first
            for run in exp.runs:
                # remove data from index container
                self._delete_local_run_data(run.hash)

            # batch delete operation for all runs, notes etc.
            self.structured_db.delete_experiment(exp_id)

    def _delete_local_run_data(self, run_hash: str):
        # remove data from index container
        index_tree = self._get_index_container('meta', timeout=0).tree()
        del index_tree.subtree(('meta', 'chunks'))[run_hash]

        # delete rocksdb containers data
        sub_dirs = ('chunks', 'progress', 'locks')
        for sub_dir in sub_dirs:
            meta_path = os.path.join(self.path, 'meta', sub_dir, run_hash)
            if os.path.isfile(meta_path):
                os.remove(meta_path)
            else:
                shutil.rmtree(meta_path, ignore_errors=True)
            seqs_path = os.path.join(self.path, 'seqs', sub_dir, run_hash)
            if os.path.isfile(seqs_path):
                os.remove(seqs_path)
            else:
                shutil.rmtree(seqs_path, ignore_errors=True)

        # remove dangling locks
        lock_path = os.path.join(self.path, 'locks', f'{run_hash}.softlock')
        if os.path.exists(lock_path):
            os.remove(lock_path)

    def _delete_run(self, run_hash):
        if self.is_remote_repo:
            return self._remote_repo_proxy.delete_run(run_hash)

        with self.structured_db:  # rollback db entity delete if subsequent actions fail.
            # remove database entry
            self.structured_db.delete_run(run_hash)
            self._delete_local_run_data(run_hash)

    def _copy_run(self, run_hash, dest_repo):
        def copy_trees():
            # copy run meta tree
            source_meta_tree = self.request_tree(
                'meta', run_hash, read_only=True, from_union=False, no_cache=True
            ).subtree('meta')
            dest_meta_tree = dest_repo.request_tree(
                'meta', run_hash, read_only=False, from_union=False, no_cache=True
            ).subtree('meta')
            dest_meta_run_tree = dest_meta_tree.subtree('chunks').subtree(run_hash)
            dest_meta_tree[...] = source_meta_tree[...]
            dest_index = dest_repo._get_index_tree('meta', timeout=10).view(())
            dest_meta_run_tree.finalize(index=dest_index)

            # copy run series tree
            source_series_run_tree = self.request_tree('seqs', run_hash, read_only=True, no_cache=True).subtree('seqs')
            dest_series_run_tree = dest_repo.request_tree('seqs', run_hash, read_only=False, no_cache=True).subtree(
                'seqs'
            )

            # copy v2 sequences
            source_v2_tree = source_series_run_tree.subtree(('v2', 'chunks', run_hash))
            dest_v2_tree = dest_series_run_tree.subtree(('v2', 'chunks', run_hash))
            for ctx_id in source_v2_tree.keys():
                for metric_name in source_v2_tree.subtree(ctx_id).keys():
                    source_val_view = source_v2_tree.subtree((ctx_id, metric_name)).array('val')
                    source_step_view = source_v2_tree.subtree((ctx_id, metric_name)).array('step', dtype='int64')
                    source_epoch_view = source_v2_tree.subtree((ctx_id, metric_name)).array('epoch', dtype='int64')
                    source_time_view = source_v2_tree.subtree((ctx_id, metric_name)).array('time', dtype='int64')

                    dest_val_view = dest_v2_tree.subtree((ctx_id, metric_name)).array('val').allocate()
                    dest_step_view = dest_v2_tree.subtree((ctx_id, metric_name)).array('step', dtype='int64').allocate()
                    dest_epoch_view = (
                        dest_v2_tree.subtree((ctx_id, metric_name)).array('epoch', dtype='int64').allocate()
                    )
                    dest_time_view = dest_v2_tree.subtree((ctx_id, metric_name)).array('time', dtype='int64').allocate()

                    for key, val in source_val_view.items():
                        dest_val_view[key] = val
                        dest_step_view[key] = source_step_view[key]
                        dest_epoch_view[key] = source_epoch_view[key]
                        dest_time_view[key] = source_time_view[key]

            # copy v1 sequences
            source_v1_tree = source_series_run_tree.subtree(('chunks', run_hash))
            dest_v1_tree = dest_series_run_tree.subtree(('chunks', run_hash))
            for ctx_id in source_v1_tree.keys():
                for metric_name in source_v1_tree.subtree(ctx_id).keys():
                    source_val_view = source_v1_tree.subtree((ctx_id, metric_name)).array('val')
                    source_epoch_view = source_v1_tree.subtree((ctx_id, metric_name)).array('epoch', dtype='int64')
                    source_time_view = source_v1_tree.subtree((ctx_id, metric_name)).array('time', dtype='int64')

                    dest_val_view = dest_v1_tree.subtree((ctx_id, metric_name)).array('val').allocate()
                    dest_epoch_view = (
                        dest_v1_tree.subtree((ctx_id, metric_name)).array('epoch', dtype='int64').allocate()
                    )
                    dest_time_view = dest_v1_tree.subtree((ctx_id, metric_name)).array('time', dtype='int64').allocate()

                    for key, val in source_val_view.items():
                        dest_val_view[key] = val
                        dest_epoch_view[key] = source_epoch_view[key]
                        dest_time_view[key] = source_time_view[key]

        def copy_structured_props():
            source_structured_run = self.structured_db.find_run(run_hash)
            dest_structured_run = dest_repo.request_props(
                run_hash, read_only=False, created_at=source_structured_run.created_at
            )
            dest_structured_run.name = source_structured_run.name
            dest_structured_run.experiment = source_structured_run.experiment
            dest_structured_run.description = source_structured_run.description
            dest_structured_run.archived = source_structured_run.archived
            for source_tag in source_structured_run.tags:
                dest_structured_run.add_tag(source_tag)

        # check run lock info. in progress runs can't be copied
        if self._lock_manager.get_run_lock_info(run_hash).locked:
            raise RuntimeError(f"Cannot copy Run '{run_hash}'. Run is locked.")

        if dest_repo.is_remote_repo:
            # create remote run
            try:
                copy_trees()
                copy_structured_props()
            except Exception as e:
                raise e
        else:
            with dest_repo.structured_db:  # rollback destination db entity if subsequent actions fail.
                # copy run structured data
                copy_structured_props()
                copy_trees()

    def close(self):
        if self._resources is None:
            return
        self._resources.close()

    @property
    def is_remote_repo(self):
        return self._client is not None

    @contextmanager
    def atomic_track(self, queue_id):
        if self.is_remote_repo:
            self._client.start_instructions_batch(queue_id)
        yield
        if self.is_remote_repo:
            self._client.flush_instructions_batch(queue_id)

    def _backup_run(self, run_hash):
        from aim.sdk.utils import backup_run

        if self.is_remote_repo:
            self._remote_repo_proxy._restore_run(run_hash)
        else:
            backup_run(self, run_hash)

    def _restore_run(self, run_hash):
        from aim.sdk.utils import restore_run_backup

        if self.is_remote_repo:
            self._remote_repo_proxy._restore_run(run_hash)
        else:
            restore_run_backup(self, run_hash)

    def _close_run(self, run_hash):
        def optimize_container(path, extra_options):
            rc = RocksContainer(path, read_only=True, **extra_options)
            rc.optimize_for_read()

        if self.is_remote_repo:
            self._remote_repo_proxy._close_run(run_hash)

        lock_manager = LockManager(self.path)

        if lock_manager.release_locks(run_hash, force=True):
            # Run rocksdb optimizations if container locks are removed
            meta_db_path = os.path.join(self.path, 'meta', 'chunks', run_hash)
            seqs_db_path = os.path.join(self.path, 'seqs', 'chunks', run_hash)
            optimize_container(meta_db_path, extra_options={'compaction': True})
            optimize_container(seqs_db_path, extra_options={})

    def _recreate_index(self):
        from tqdm import tqdm

        if self.is_remote_repo:
            self._remote_repo_proxy._recreate_index()
            return

        from aim.sdk.index_manager import RepoIndexManager

        index_manager = RepoIndexManager.get_index_manager(self, disable_monitoring=True)

        # force delete the index db and the locks

        index_lock_path = os.path.join(self.path, 'locks', 'index')
        if os.path.exists(index_lock_path):
            os.remove(index_lock_path)

        index_db_path = os.path.join(self.path, 'meta', 'index')
        shutil.rmtree(index_db_path, ignore_errors=True)

        # recreate the index db
        run_hashes = self._all_run_hashes()
        for run_hash in tqdm(run_hashes, desc='Indexing runs', total=len(run_hashes)):
            index_manager.index(run_hash)
