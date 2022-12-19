import os
import uuid

from aim.ext.transport.config import AIM_SERVER_MOUNTED_REPO_PATH
from aim.ext.transport.message_utils import unpack_args

from aim.sdk import Repo
from aim.sdk.reporter import RunStatusReporter, ScheduledStatusReporter
from aim.ext.cleanup import AutoClean
from aim.storage.treeutils import decode_tree


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


def get_tree(args: bytes):
    repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
    if repo_path:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()
    kwargs = decode_tree(unpack_args(args))
    name = kwargs['name']
    sub = kwargs['sub']
    read_only = kwargs['read_only']
    from_union = kwargs['from_union']
    index = kwargs['index']
    timeout = kwargs['timeout']
    if index:
        return ResourceRef(repo._get_index_tree(name, timeout))
    else:
        return ResourceRef(repo.request_tree(name, sub, read_only=read_only, from_union=from_union))


def get_structured_run(args: bytes):
    repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
    if repo_path:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()

    kwargs = decode_tree(unpack_args(args))
    hash_ = kwargs['hash_']
    read_only = kwargs['read_only']

    return ResourceRef(repo.request_props(hash_, read_only))


def get_repo(args: bytes):
    repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
    if repo_path:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()
    return ResourceRef(repo)


def get_lock(args: bytes):
    repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
    if repo_path:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()
    kwargs = decode_tree(unpack_args(args))
    run_hash = kwargs['run_hash']
    # TODO Do we need to import SFRunLock here?
    from aim.sdk.lock_manager import SFRunLock
    return ResourceRef(repo.request_run_lock(run_hash), SFRunLock.release)


def get_run_heartbeat(args: bytes):
    repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
    if repo_path:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()
    kwargs = decode_tree(unpack_args(args))
    run_hash = kwargs['run_hash']
    return ResourceRef(ScheduledStatusReporter(RunStatusReporter(run_hash, repo.path)), ScheduledStatusReporter.stop)
