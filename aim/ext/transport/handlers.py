import os
import struct

from aim.sdk import Repo
from aim.ext.transport.config import AIM_SERVER_MOUNTED_REPO_PATH


def get_tree(name: bytes, sub: bytes, read_only: bytes, from_union: bytes, index: bytes, timeout: bytes):
    repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
    if repo_path:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()

    read_only = struct.unpack('?', read_only)[0]
    from_union = struct.unpack('?', from_union)[0]
    index = struct.unpack('?', index)[0]
    timeout = struct.unpack('I', timeout)[0]
    if index:
        return repo._get_index_tree(name.decode(), timeout)
    else:
        return repo.request_tree(name.decode(), sub.decode(), read_only=read_only, from_union=from_union)


def get_structured_run(hash_: bytes, read_only: bytes):
    repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
    if repo_path:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()
    read_only = struct.unpack('?', read_only)[0]
    return repo.request_props(hash_.decode(), read_only)
