import os
import uuid

from aimcore.transport.config import AIM_SERVER_MOUNTED_REPO_PATH

from aim import Repo
from aim._sdk.local_storage import LocalFileManager
from aimcore.cleanup import AutoClean


class ResourceRefAutoClean(AutoClean['ResourceRef']):
    @staticmethod
    def noop(res: object):
        return

    def __init__(self, instance: 'ResourceRef'):
        super().__init__(instance)
        self._finalizer_func = instance._finalizer_func
        self._resource = instance._resource

    def _close(self):
        self._finalizer_func(self._resource)


class ResourceRef:
    def __init__(self, res_obj, finalizer_func=ResourceRefAutoClean.noop):
        self._resource = res_obj
        self._finalizer_func = finalizer_func
        self._auto_clean = ResourceRefAutoClean(self)

    @property
    def ref(self):
        return self._resource


def get_handler():
    return str(uuid.uuid4())


def get_tree(**kwargs):
    repo_path = os.environ[AIM_SERVER_MOUNTED_REPO_PATH]
    repo = Repo.from_path(repo_path)

    name = kwargs['name']
    sub = kwargs['sub']
    read_only = kwargs['read_only']
    return ResourceRef(repo.storage_engine.tree(hash_=sub, name=name, read_only=read_only))


def get_repo():
    repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
    repo = Repo.from_path(repo_path)
    return ResourceRef(repo)


def get_khash_array(**kwargs):
    tree = kwargs['tree']
    path = kwargs['path']
    return ResourceRef(tree.reservoir(path))


def get_lock(**kwargs):
    repo_path = os.environ[AIM_SERVER_MOUNTED_REPO_PATH]
    repo = Repo.from_path(repo_path)
    run_hash = kwargs['run_hash']
    # TODO Do we need to import SFRunLock here?
    from aim._sdk.lock_manager import SFRunLock
    return ResourceRef(repo.storage_engine._lock_manager.get_container_lock(run_hash), SFRunLock.release)


def get_file_manager(**kwargs):
    repo_path = os.environ[AIM_SERVER_MOUNTED_REPO_PATH]
    repo = Repo.from_path(repo_path)
    return ResourceRef(LocalFileManager(repo.path))


def get_dev_package(**kwargs):
    repo_path = os.environ[AIM_SERVER_MOUNTED_REPO_PATH]
    repo = Repo.from_path(repo_path)

    name = kwargs['name']
    return ResourceRef(repo.storage_engine.dev_package(name))
