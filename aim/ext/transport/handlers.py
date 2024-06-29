import os
import pathlib
import uuid

from datetime import datetime

import pytz

from aim.ext.cleanup import AutoClean
from aim.ext.transport.config import AIM_SERVER_MOUNTED_REPO_PATH
from aim.sdk import Repo
from aim.sdk.reporter import RunStatusReporter, ScheduledStatusReporter
from aim.sdk.reporter.file_manager import LocalFileManager


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
    repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
    if repo_path:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()
    name = kwargs['name']
    sub = kwargs['sub']
    read_only = kwargs['read_only']
    from_union = kwargs['from_union']
    index = kwargs['index']
    timeout = kwargs['timeout']
    no_cache = kwargs.get('no_cache', False)
    if index:
        return ResourceRef(repo._get_index_tree(name, timeout))
    else:
        return ResourceRef(repo.request_tree(name, sub, read_only=read_only, from_union=from_union, no_cache=no_cache))


def get_structured_run(hash_, read_only, created_at, **kwargs):
    repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
    if repo_path:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()
    if created_at is not None:
        created_at = datetime.fromtimestamp(created_at, tz=pytz.utc).replace(tzinfo=None)
    return ResourceRef(repo.request_props(hash_, read_only, created_at))


def get_repo():
    repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
    if repo_path:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()
    return ResourceRef(repo)


def get_lock(**kwargs):
    repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
    if repo_path:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()
    run_hash = kwargs['run_hash']
    # TODO Do we need to import SFRunLock here?
    from aim.sdk.lock_manager import SFRunLock

    return ResourceRef(repo.request_run_lock(run_hash), SFRunLock.release)


def get_run_heartbeat(run_hash, **kwargs):
    repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
    if repo_path:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()
    status_reporter = RunStatusReporter(run_hash, LocalFileManager(repo.path))
    progress_flag_path = pathlib.Path(repo.path) / 'meta' / 'progress' / run_hash
    return ResourceRef(
        ScheduledStatusReporter(status_reporter, touch_path=progress_flag_path), ScheduledStatusReporter.stop
    )


def get_file_manager(**kwargs):
    repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
    if repo_path:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()
    return ResourceRef(LocalFileManager(repo.path))
