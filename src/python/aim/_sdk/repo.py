import logging
import os
import shutil

from collections import defaultdict
from typing import Union, Type, List, Dict, Optional, Tuple
from weakref import WeakValueDictionary

from aim._sdk.configs import get_aim_repo_name
from aim._sdk.utils import clean_repo_path

from aim._sdk import type_utils
from aim._sdk.container import Container
from aim._sdk.sequence import Sequence
from aim._sdk.function import Function
from aim._sdk.collections import ContainerCollection, SequenceCollection
from aim._sdk.query_utils import construct_query_expression
from aim._sdk.constants import KeyNames
# from aim._sdk.exceptions import AmbiguousQueryTypeError, UnknownQueryTypeError

from aim._sdk.storage_engine import StorageEngine
from aim._sdk.local_storage import LocalStorage
from aim._sdk.remote_storage import RemoteStorage, RemoteRepoProxy

from aim._ext.system_info.resource_tracker import ResourceTracker

logger = logging.getLogger(__name__)


class Repo(object):
    _pool: Dict[str, 'Repo'] = WeakValueDictionary()

    @staticmethod
    def is_remote_path(path: str) -> bool:
        return path.startswith('aim://')

    @classmethod
    def default(cls) -> 'Repo':
        return cls.from_path('aim://127.0.0.1:53800')

    @classmethod
    def from_path(cls, path: str, read_only: bool = True) -> 'Repo':
        """Named constructor for Repo for given path.

        Arguments:
            path (:obj:`str`): Path to Aim repository.
            read_only (:obj:`bool`, optional): Flag for opening Repo in readonly mode. False by default.
            init (:obj:`bool`, optional): Flag used to initialize new Repo. False by default.
                Recommended to use ``aim init`` command instead.
        Returns:
            :obj:`Repo` object.
        """
        if not cls.is_remote_path(path):
            path = clean_repo_path(path)
        repo = cls._pool.get(path)
        if repo is None:
            repo = cls(path, read_only=read_only)
            cls._pool[path] = repo
        return repo

    @classmethod
    def active_repo(cls) -> 'Repo':
        if len(cls._pool) == 0:
            return cls.default()
        elif len(cls._pool) == 1:
            path = next(cls._pool.keys())
            return cls._pool[path]
        else:
            raise ValueError('Cannot determine active Repo. Please use Repo.from_path() instead.')

    def __init__(self, path: str, *, read_only: Optional[bool] = True):
        self.read_only = read_only
        self._is_remote_repo = False
        if self.is_remote_path(path):
            self._is_remote_repo = True
            self._storage_engine = RemoteStorage(path)
            self._remote_repo_proxy = RemoteRepoProxy(self._storage_engine._client)
        else:
            self.root_path = path
            self.path = os.path.join(self.root_path, get_aim_repo_name())
            self._storage_engine = LocalStorage(self.path, read_only=read_only)

        self._system_tracker: ResourceTracker = None
        self._encryption_key: str = None
        self._meta_tree = self._storage_engine.tree(None, 'meta', read_only=True)

    def __repr__(self) -> str:
        return f'<Repo#{hash(self)} path={self.path} read_only={self.read_only}>'

    def __hash__(self) -> int:
        return hash(self.path)

    @classmethod
    def exists(cls, path: str) -> bool:
        aim_repo_path = os.path.join(clean_repo_path(path), get_aim_repo_name())
        return os.path.exists(aim_repo_path)

    @classmethod
    def init(cls, path: str):
        aim_repo_path = os.path.join(clean_repo_path(path), get_aim_repo_name())
        os.makedirs(aim_repo_path, exist_ok=True)
        return cls.from_path(aim_repo_path, read_only=False)

    @classmethod
    def rm(cls, path: str):
        aim_repo_path = os.path.join(clean_repo_path(path), get_aim_repo_name())
        shutil.rmtree(aim_repo_path)

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

    @property
    def dev_package_dir(self) -> str:
        dev_package_dir_path = os.path.join(self.path, 'pkgs')
        if not os.path.exists(dev_package_dir_path):
            os.mkdir(dev_package_dir_path)
        return dev_package_dir_path

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

    def tracked_container_types(self) -> List[str]:
        return list(self._meta_tree.subtree(KeyNames.CONTAINERS).keys())

    def tracked_sequence_types(self) -> List[str]:
        return list(self._meta_tree.subtree(KeyNames.SEQUENCES).keys())

    def tracked_sequence_infos(self, sequence_type: str) -> Dict[str, List]:
        if sequence_type not in Sequence.registry:
            raise ValueError(f'Unknown sequence type \'{sequence_type}\'.')
        try:
            infos = self._meta_tree[KeyNames.SEQUENCES, sequence_type]
        except KeyError:
            return {}
        seq_infos = defaultdict(list)
        for ctx_idx, names in infos.items():
            context_dict = self._meta_tree[KeyNames.CONTEXTS, ctx_idx]
            for seq_name in names.keys():
                seq_infos[seq_name].append(context_dict)
        return seq_infos

    def tracked_params(self) -> Dict:
        try:
            return self._meta_tree.collect('attrs', strict=False)
        except KeyError:
            return {}

    def registered_container_types(self) -> List[str]:
        return list(Container.registry.keys())

    def registered_sequence_types(self) -> List[str]:
        return list(Sequence.registry.keys())

    def registered_functions(self) -> List[str]:
        return list(Function.registry.keys())

    def get_container(self, hash_) -> Container:
        return Container(hash_, repo=self, mode='READONLY')

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
                KeyNames.CONTAINER_TYPES_MAP: self._meta_tree.subtree(KeyNames.CONTAINER_TYPES_MAP),
                KeyNames.CONTAINER_TYPE: type_,
                'required_typename': type_.get_full_typename(),
            })
            # return ContainerCollection[type_](query_context=query_context)
            return ContainerCollection(query_context=query_context)
        if issubclass(orig_type, Sequence):
            query_context.update({
                KeyNames.ALLOWED_VALUE_TYPES: type_utils.get_sequence_value_types(type_),
                KeyNames.CONTAINER_TYPE: Container,
                KeyNames.SEQUENCE_TYPE: type_,
                'required_typename': type_.get_full_typename(),
            })
            # return SequenceCollection[type_](query_context=query_context)
            return SequenceCollection(query_context=query_context)

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
                logger.warning(f'Error while trying to delete run \'{run_hash}\'. {str(e)}')
                remaining_runs.append(run_hash)

        if remaining_runs:
            return False, remaining_runs
        else:
            return True, []

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
            logger.warning(f'Error while trying to delete run \'{run_hash}\'. {str(e)}')
            return False

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
                logger.warning(f'Error while trying to move run \'{run_hash}\'. {str(e)}')
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
                logger.warning(f'Error while trying to copy run \'{run_hash}\'. {str(e)}')
                remaining_runs.append(run_hash)

        if remaining_runs:
            return False, remaining_runs
        else:
            return True, []

    def _delete_run(self, run_hash):
        if self._is_remote_repo:
            return self._remote_repo_proxy._delete_run(run_hash)

        # check run lock info. in progress runs can't be deleted
        if self.storage_engine._lock_manager.get_run_lock_info(run_hash).locked:
            raise RuntimeError(f'Cannot delete Run \'{run_hash}\'. Run is locked.')

        # remove container meta tree
        meta_tree = self.storage_engine.tree(run_hash, 'meta', read_only=False)
        del meta_tree.subtree('chunks')[run_hash]
        # remove container sequence tree
        seq_tree = self.storage_engine.tree(run_hash, 'seqs', read_only=False)
        del seq_tree.subtree('chunks')[run_hash]

        # remove container blobs trees
        blobs_tree = self._storage_engine.tree(run_hash, 'BLOBS', read_only=False)
        del blobs_tree.subtree(('meta', 'chunks'))[run_hash]
        del blobs_tree.subtree(('seqs', 'chunks'))[run_hash]

        # delete entry from container map
        del meta_tree.subtree('cont_types_map')[run_hash]

    def _copy_run(self, run_hash, dest_repo):
        def copy_trees():
            source_meta_tree = self._meta_tree
            dest_meta_tree = dest_repo._storage_engine.tree(run_hash, 'meta', read_only=False)

            source_meta_run_tree_collected = source_meta_tree.subtree('chunks').subtree(run_hash).collect()

            # write destination meta tree info
            source_meta_run_attrs_tree_collected = source_meta_run_tree_collected['attrs']
            dest_meta_attrs_tree = dest_meta_tree.subtree('attrs')
            for key, val in source_meta_run_attrs_tree_collected.items():
                dest_meta_attrs_tree.merge(key, val)

            cont_type = source_meta_run_tree_collected[KeyNames.INFO_PREFIX]['cont_type'].split('->')[-1]

            dest_meta_tree[('cont_types_map', run_hash)] = source_meta_tree[('cont_types_map', run_hash)]
            dest_meta_tree[('containers', cont_type)] = 1

            for ctx_idx, ctx in source_meta_run_tree_collected[KeyNames.CONTEXTS].items():
                dest_meta_tree[(KeyNames.CONTEXTS, ctx_idx)] = ctx

            for ctx_idx in source_meta_run_tree_collected['sequences'].keys():
                for seq_name in source_meta_run_tree_collected['sequences'][ctx_idx].keys():
                    seq_typename = source_meta_run_tree_collected['sequences'][ctx_idx][seq_name][KeyNames.INFO_PREFIX][KeyNames.SEQUENCE_TYPE]
                    for typename in seq_typename.split('->'):
                        dest_meta_tree[(KeyNames.SEQUENCES, typename, ctx_idx, seq_name)] = 1

            # copy run meta tree
            dest_meta_tree[('chunks', run_hash)] = source_meta_run_tree_collected

            # copy run series tree
            source_series_run_tree = self.storage_engine.tree(run_hash, 'seqs', read_only=True).subtree('chunks').subtree(run_hash)
            dest_series_run_tree = dest_repo.storage_engine.tree(run_hash, 'seqs', read_only=False).subtree('chunks').subtree(run_hash)

            try:
                dest_series_run_tree[...] = source_series_run_tree[...]
            except KeyError:
                pass

        try:
            copy_trees()
        except Exception as e:
            raise e

    def _close_run(self, run_hash):
        from aim._sdk.utils import utc_timestamp

        if self._is_remote_repo:
            return self._remote_repo_proxy._close_run(run_hash)

        # release run locks
        self._storage_engine._lock_manager.release_locks(run_hash, force=True)

        # set end time if needed
        run_meta_tree = self._storage_engine.tree(-1, 'meta', read_only=False).subtree('chunks').subtree(run_hash)
        if not run_meta_tree.get((KeyNames.INFO_PREFIX, 'end_time')):
            run_meta_tree[(KeyNames.INFO_PREFIX, 'end_time')] = utc_timestamp()

    def prune(self):
        """
        Utility function to remove dangling/orphan params/sequences with no referring runs.
        """
        from aim._sdk.utils import prune
        if self._is_remote_repo:
            return self._remote_repo_proxy.prune()

        prune(self)
