import os

from aim.sdk import Repo
from aim.ext.transport.config import AIM_SERVER_MOUNTED_REPO_PATH
from aim.ext.transport.message_utils import unpack_args
from aim.storage.treeutils import decode_tree


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
        return repo._get_index_tree(name, timeout)
    else:
        return repo.request_tree(name, sub, read_only=read_only, from_union=from_union)


def get_structured_run(args: bytes):
    repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
    if repo_path:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()

    kwargs = decode_tree(unpack_args(args))
    hash_ = kwargs['hash_']
    read_only = kwargs['read_only']

    return repo.request_props(hash_, read_only)
