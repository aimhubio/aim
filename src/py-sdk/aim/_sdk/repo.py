import logging
import os
import shutil

from collections import defaultdict
from typing import Union, Type, List, Dict, Optional
from weakref import WeakValueDictionary

from aim._sdk.configs import get_aim_repo_name
from aim._sdk.utils import clean_repo_path

from aim._sdk import type_utils
from aim._sdk.container import Container
from aim._sdk.sequence import Sequence
from aim._sdk.collections import ContainerCollection, SequenceCollection
from aim._sdk.query_utils import construct_query_expression
from aim._sdk.constants import KeyNames
# from aim._sdk.exceptions import AmbiguousQueryTypeError, UnknownQueryTypeError

from aim._sdk.storage_engine import StorageEngine
from aim._sdk.local_storage import LocalStorage
from aim._sdk.remote_storage import RemoteStorage

from aim._ext.system_info.resource_tracker import ResourceTracker

logger = logging.getLogger(__name__)


class Repo(object):
    _pool = WeakValueDictionary()

    @staticmethod
    def is_remote_path(path: str) -> bool:
        return path.startswith('aim://')

    @classmethod
    def default(cls):
        return cls.from_path('aim://127.0.0.1:53800')

    @classmethod
    def from_path(cls, path: str, read_only: bool = True):
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

    def __init__(self, path: str, *, read_only: Optional[bool] = True):
        self.read_only = read_only
        if self.is_remote_path(path):
            self._storage_engine = RemoteStorage(path)
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
            return ContainerCollection[type_](query_context=query_context)
        if issubclass(orig_type, Sequence):
            query_context.update({
                KeyNames.ALLOWED_VALUE_TYPES: type_utils.get_sequence_value_types(type_),
                KeyNames.CONTAINER_TYPE: Container,
                KeyNames.SEQUENCE_TYPE: type_,
                'required_typename': type_.get_full_typename(),
            })
            return SequenceCollection[type_](query_context=query_context)
