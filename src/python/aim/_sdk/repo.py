"""
The repo module contains implementation of class Repo; a core class for accessing the data logged in Aim.
It provides interfaces for creating and managing Aim repositories, for both local and remote setups.
Repo class can be used to query stored Containers and Sequences, as well as get the metadata about logs, such as
registered types, actions, packages, summary of logged types, etc.
"""

import logging
import os
import shutil

from collections import defaultdict
from typing import Union, Type, List, Dict, Optional, Tuple
from weakref import WeakValueDictionary

from aim._sdk.configs import get_aim_repo_name, get_data_version
from aim._sdk.utils import clean_repo_path

from aim._sdk import type_utils
from aim._sdk.container import Container
from aim._sdk.sequence import Sequence
from aim._sdk.action import Action
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
    """
    Represents an Aim repository, handling both local and remote repositories.
    """

    _pool: Dict[str, 'Repo'] = WeakValueDictionary()

    @staticmethod
    def is_remote_path(path: str) -> bool:
        """
        Determines if the provided path refers to a remote repository.

        Args:
            path (str): The path to be checked.

        Returns:
            bool: True if the path is remote, otherwise False.
        """
        return path.startswith('aim://')

    @classmethod
    def default(cls) -> 'Repo':
        """
        Retrieves the default repository instance.

        Returns:
            Repo: Default repository instance.
        """
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
    def get_version(cls, path: str) -> Optional[Tuple[int, ...]]:
        """
        Retrieves the version of the Aim repository at the given path.

        Args:
            path (str): The repository path.

        Returns:
            Optional[Tuple[int, ...]]: Version tuple if the path refers to a valid Aim repository, otherwise None.
        """
        if cls.is_remote_path(path):
            return None
        path = clean_repo_path(path)
        version_file_path = os.path.join(path, get_aim_repo_name(), 'VERSION')
        if os.path.exists(version_file_path):
            with open(version_file_path, 'r') as version_fh:
                version_tp = version_fh.read().strip().split('.')
                return tuple(map(int, version_tp))
        return None

    @classmethod
    def active_repo(cls) -> 'Repo':
        """
        Retrieves the currently active repository.

        Returns:
            Repo: The active repository instance.

        Raises:
            ValueError: If it's not possible to determine the active repository.
        """
        if len(cls._pool) == 0:
            return cls.default()
        elif len(cls._pool) == 1:
            path = next(cls._pool.keys())
            return cls._pool[path]
        else:
            raise ValueError('Cannot determine active Repo. Please use Repo.from_path() instead.')

    @classmethod
    def exists(cls, path: str) -> bool:
        """
        Checks if an Aim repository exists at the given path.

        Args:
            path (str): The path to check.

        Returns:
            bool: True if the Aim repository exists, otherwise False.
        """
        aim_repo_path = os.path.join(clean_repo_path(path), get_aim_repo_name())
        return os.path.exists(aim_repo_path)

    @classmethod
    def init(cls, path: str):
        """
        Initializes a new Aim repository at the given path.

        Args:
            path (str): Path where the Aim repository should be created.

        Returns:
            Repo: The newly initialized repository instance.
        """
        aim_repo_path = os.path.join(clean_repo_path(path), get_aim_repo_name())
        os.makedirs(aim_repo_path, exist_ok=True)

        version_file_path = os.path.join(aim_repo_path, 'VERSION')
        with open(version_file_path, 'w') as version_fh:
            version_fh.write('.'.join(map(str, get_data_version())) + '\n')

        return cls.from_path(aim_repo_path, read_only=False)

    @classmethod
    def rm(cls, path: str):
        """
        Deletes an Aim repository at the given path.

        Args:
            path (str): The path to the Aim repository to be deleted.
        """
        aim_repo_path = os.path.join(clean_repo_path(path), get_aim_repo_name())
        shutil.rmtree(aim_repo_path)

    def __init__(self, path: str, *, read_only: Optional[bool] = True):
        """
        Initializes a repository instance.

        Args:
            path (str): Path to the Aim repository.
            read_only (bool, optional): If True, opens the repo in read-only mode. Default is True.
        """
        self.read_only = read_only
        self._is_remote_repo = False
        if self.is_remote_path(path):
            self.path = os.path.join(path, get_aim_repo_name())
            self._is_remote_repo = True
            self._storage_engine = RemoteStorage(path)
            self._remote_repo_proxy = RemoteRepoProxy(self._storage_engine._client)
        else:
            if self.get_version(path) != get_data_version():
                raise RuntimeError(f'Aim repo \'{path}\' is out of date. '
                                   f'Please update repo by running `aim migrate --repo {path}`')
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

    @property
    def storage_engine(self) -> StorageEngine:
        """
        Returns the storage engine associated with the repository.

        Returns:
            StorageEngine: The storage engine instance.
        """
        return self._storage_engine

    @property
    def resource_tracker(self) -> ResourceTracker:
        """
        Returns the resource tracker associated with the repository.

        Returns:
            ResourceTracker: The resource tracker instance.
        """
        if self._system_tracker is None:
            self._system_tracker = ResourceTracker()
        return self._system_tracker

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
        """
        Lists all container types being tracked in the repository.

        Returns:
            List[str]: List of tracked container types.
        """
        return list(self._meta_tree.subtree(KeyNames.CONTAINERS).keys())

    def tracked_sequence_types(self) -> List[str]:
        """
        Lists all sequence types being tracked in the repository.

        Returns:
            List[str]: List of tracked sequence types.
        """
        return list(self._meta_tree.subtree(KeyNames.SEQUENCES).keys())

    def tracked_sequence_infos(self, sequence_type: str) -> Dict[str, List]:
        """
        Retrieves information for a specific sequence type.

        Args:
            sequence_type (str): The sequence type to retrieve information for.

        Returns:
            Dict[str, List]: Dictionary of tracked sequence names/contexts.
        """
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
        """
        Retrieves all tracked parameters for the repository.

        Returns:
            Dict: Dictionary of tracked parameters.
        """
        try:
            return self._meta_tree.collect('attrs', strict=False)
        except KeyError:
            return {}

    def registered_container_types(self) -> List[str]:
        """
        Lists all registered container types in the repository.

        Returns:
            List[str]: List of registered container types.
        """
        return list(Container.registry.keys())

    def registered_sequence_types(self) -> List[str]:
        """
        Lists all registered sequence types in the repository.

        Returns:
            List[str]: List of registered sequence types.
        """
        return list(Sequence.registry.keys())

    def registered_actions(self) -> List[str]:
        """
        Lists all registered actions in the repository.

        Returns:
            List[str]: List of registered actions.
        """
        return list(Action.registry.keys())

    @property
    def container_hashes(self):
        """
        Retrieves a list of hashes for all tracked containers.

        Returs:
            List[str]: List of container hashes.
        """
        return list(self._meta_tree.subtree('chunks').keys())

    def get_container(self, hash_) -> Container:
        """
        Retrieves a container from the repository based on its hash.

        Args:
            hash_ (str): The hash of the container to retrieve.

        Returns:
            Container: The corresponding container object.
        """
        return Container(hash_, repo=self, mode='READONLY')

    def containers(self,
                   query_: Optional[str] = None,
                   type_: Union[str, Type[Container]] = Container,
                   **kwargs) -> ContainerCollection:
        """
        Retrieves a collection of containers based on the query expression and type.

        Args:
            query_ (Optional[str]): The query string to filter containers.
            type_ (Union[str, Type[Container]]): The type of containers to retrieve.

        Returns:
            ContainerCollection: The resulting collection of containers.
        """
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
        """
        Retrieves a collection of sequences based on the query expression and type.

        Args:
            query_ (Optional[str]): The query string to filter sequences.
            type_ (Union[str, Type[Sequence]]): The type of sequences to retrieve.

        Returns:
            SequenceCollection: The resulting collection of sequences.
        """
        q = construct_query_expression('sequence', query_, **kwargs)

        if isinstance(type_, str):
            seq_types = Sequence.registry.get(type_)
            if len(seq_types) > 1:
                raise ValueError(f'Multiple matching sequence types for type name \'{type_}\'. '
                                 f'Please include sequence package name.')
            type_ = seq_types[0]

        return self._select(type_).filter(q) if q else self._select(type_)

    def add_package(self, pkg_name: str) -> bool:
        """
        Adds a package to the repository.

        Args:
            pkg_name (str): The name of the package to be added.

        Returns:
            bool: True if the package was added successfully, False if it already exists.
        """
        if self._is_remote_repo:
            return self._remote_repo_proxy.add_package(pkg_name)
        active_pkg_file = os.path.join(self.path, 'active_pkg')
        with open(active_pkg_file, 'a+') as apf:
            apf.seek(0)
            packages = set(line.strip() for line in apf.readlines())
            if pkg_name in packages:
                return False
            packages.add(pkg_name)
            apf.seek(0)
            apf.truncate()
            for package in packages:
                apf.write(f"{package}\n")
        return True

    def remove_package(self, pkg_name: str) -> bool:
        """
        Removes a package from the repository.

        Args:
            pkg_name (str): The name of the package to be removed.

        Returns:
            bool: True if the package was removed successfully, False if it doesn't exist.
        """
        if self._is_remote_repo:
            return self._remote_repo_proxy.remove_package(pkg_name)
        active_pkg_file = os.path.join(self.path, 'active_pkg')
        with open(active_pkg_file, 'a+') as apf:
            apf.seek(0)
            packages = set(line.strip() for line in apf.readlines())
            if pkg_name not in packages:
                return False
            packages.remove(pkg_name)
            apf.seek(0)
            apf.truncate()
            for package in packages:
                apf.write(f"{package}\n")
        return True

    def load_active_packages(self):
        """
        Loads all active packages in the repository. Only applicable for local repositories.

        Note:
            This method doesn't return any value but has side effects on the state of loaded packages.
        """
        if self._is_remote_repo:
            return
        from aim._sdk.package_utils import Package
        active_pkg_file = os.path.join(self.path, 'active_pkg')
        if os.path.exists(active_pkg_file):
            pkgs_dir = os.path.join(self.path, 'pkgs')
            with open(active_pkg_file, 'r') as apf:
                for pkg_name in apf.read().split():
                    Package.load_package(pkg_name, pkgs_dir)

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

    def delete_containers(self, container_hashes: List[str]) -> Tuple[bool, List[str]]:
        """Deletes multiple Containers data from aim repository

        This action removes containers data permanently and cannot be reverted.
        If you want to archive container but keep it's data use `repo.get_container(container_hash).archived = True`.

        Args:
            container_hashes (:obj:`str`): list of Containers to be deleted.

        Returns:
            (True, []) if all containers deleted successfully,
            (False, :obj:`list`) with list of remaining containers otherwise.
        """
        remaining_containers = []
        for container_hash in container_hashes:
            try:
                self._delete_container(container_hash)
            except Exception as e:
                logger.warning(f'Error while trying to delete container \'{container_hash}\'. {str(e)}')
                remaining_containers.append(container_hash)

        if remaining_containers:
            return False, remaining_containers
        else:
            return True, []

    def delete_container(self, container_hash: str) -> bool:
        """Delete Container data from aim repository

        This action removes container data permanently and cannot be reverted.
        If you want to archive container but keep it's data use `repo.get_container(container_hash).archived = True`.

        Args:
            container_hash (:obj:`str`): Container to be deleted.

        Returns:
            True if container deleted successfully, False otherwise.
        """
        try:
            self._delete_container(container_hash)
            return True
        except Exception as e:
            logger.warning(f'Error while trying to delete container \'{container_hash}\'. {str(e)}')
            return False

    def move_containers(self, container_hashes: List[str], dest_repo: 'Repo') -> Tuple[bool, List[str]]:
        """Move multiple Containers data from current aim repository to destination aim repository

        Args:
            container_hashes (:obj:`str`): list of Containers to be moved.
            dest_repo (:obj:`Repo`): destination Repo instance to move Containers

        Returns:
            (True, []) if all containers were moved successfully,
            (False, :obj:`list`) with list of remaining containers otherwise.
        """
        from tqdm import tqdm
        remaining_containers = []
        for container_hash in tqdm(container_hashes):
            try:
                self._copy_container(container_hash, dest_repo)
                self._delete_container(container_hash)
            except Exception as e:
                logger.warning(f'Error while trying to move container \'{container_hash}\'. {str(e)}')
                remaining_containers.append(container_hash)

        if remaining_containers:
            return False, remaining_containers
        else:
            return True, []

    def copy_containers(self, container_hashes: List[str], dest_repo: 'Repo') -> Tuple[bool, List[str]]:
        """Copy multiple Containers data from current aim repository to destination aim repository

        Args:
            container_hashes (:obj:`str`): list of Containers to be copied.
            dest_repo (:obj:`Repo`): destination Repo instance to copy Containers

        Returns:
            (True, []) if all containers were copied successfully,
            (False, :obj:`list`) with list of remaining containers otherwise.
        """
        from tqdm import tqdm
        remaining_containers = []
        for container_hash in tqdm(container_hashes):
            try:
                self._copy_container(container_hash, dest_repo)
            except Exception as e:
                logger.warning(f'Error while trying to copy container \'{container_hash}\'. {str(e)}')
                remaining_containers.append(container_hash)

        if remaining_containers:
            return False, remaining_containers
        else:
            return True, []

    def _delete_container(self, container_hash):
        if self._is_remote_repo:
            return self._remote_repo_proxy._delete_container(container_hash)

        # check container lock info. in progress containers can't be deleted
        if self.storage_engine._lock_manager.get_container_lock_info(container_hash).locked:
            raise RuntimeError(f'Cannot delete Container \'{container_hash}\'. Container is locked.')

        # remove container meta tree
        meta_tree = self.storage_engine.tree(container_hash, 'meta', read_only=False)
        del meta_tree.subtree('chunks')[container_hash]
        # remove container sequence tree
        seq_tree = self.storage_engine.tree(container_hash, 'seqs', read_only=False)
        del seq_tree.subtree('chunks')[container_hash]

        # remove container blobs trees
        blobs_tree = self._storage_engine.tree(container_hash, 'BLOBS', read_only=False)
        del blobs_tree.subtree(('meta', 'chunks'))[container_hash]
        del blobs_tree.subtree(('seqs', 'chunks'))[container_hash]

        # delete entry from container map
        del meta_tree.subtree('cont_types_map')[container_hash]

    def _copy_container(self, container_hash, dest_repo):
        def copy_trees():
            source_meta_tree = self._meta_tree
            dest_meta_tree = dest_repo._storage_engine.tree(container_hash, 'meta', read_only=False)

            source_meta_container_tree_collected = source_meta_tree.subtree('chunks').subtree(container_hash).collect()

            # write destination meta tree info
            source_meta_container_attrs_tree_collected = source_meta_container_tree_collected['attrs']
            dest_meta_attrs_tree = dest_meta_tree.subtree('attrs')
            for key, val in source_meta_container_attrs_tree_collected.items():
                dest_meta_attrs_tree.merge(key, val)

            cont_type = source_meta_container_tree_collected[KeyNames.INFO_PREFIX]['cont_type'].split('->')[-1]

            dest_meta_tree[('cont_types_map', container_hash)] = source_meta_tree[('cont_types_map', container_hash)]
            dest_meta_tree[('containers', cont_type)] = 1

            for ctx_idx, ctx in source_meta_container_tree_collected[KeyNames.CONTEXTS].items():
                dest_meta_tree[(KeyNames.CONTEXTS, ctx_idx)] = ctx

            for ctx_idx in source_meta_container_tree_collected['sequences'].keys():
                for seq_name in source_meta_container_tree_collected['sequences'][ctx_idx].keys():
                    seq_typename = source_meta_container_tree_collected['sequences'][ctx_idx][seq_name][KeyNames.INFO_PREFIX][KeyNames.SEQUENCE_TYPE] # noqa
                    for typename in seq_typename.split('->'):
                        dest_meta_tree[(KeyNames.SEQUENCES, typename, ctx_idx, seq_name)] = 1

            # copy container meta tree
            dest_meta_tree[('chunks', container_hash)] = source_meta_container_tree_collected

            # copy container series tree
            source_series_container_tree = self.storage_engine.\
                tree(container_hash, 'seqs', read_only=True).\
                subtree('chunks').subtree(container_hash)
            dest_series_container_tree = dest_repo.storage_engine.\
                tree(container_hash, 'seqs', read_only=False).\
                subtree('chunks').subtree(container_hash)

            try:
                dest_series_container_tree[...] = source_series_container_tree[...]
            except KeyError:
                pass

        try:
            copy_trees()
        except Exception as e:
            raise e

    def _close_container(self, container_hash):
        from aim._sdk.utils import utc_timestamp

        if self._is_remote_repo:
            return self._remote_repo_proxy._close_container(container_hash)

        # release container locks
        self._storage_engine._lock_manager.release_locks(container_hash, force=True)

        # set end time if needed
        container_meta_tree = self._storage_engine.\
            tree(-1, 'meta', read_only=False).\
            subtree('chunks').subtree(container_hash)
        if not container_meta_tree.get((KeyNames.INFO_PREFIX, 'end_time')):
            container_meta_tree[(KeyNames.INFO_PREFIX, 'end_time')] = utc_timestamp()

    def prune(self):
        """
        Removes dangling/orphan params/sequences with no referring containers.
        """
        from aim._sdk.utils import prune
        if self._is_remote_repo:
            return self._remote_repo_proxy.prune()

        prune(self)
