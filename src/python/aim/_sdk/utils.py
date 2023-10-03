import datetime
import os
import pathlib
import uuid

from typing import Union, Any, Tuple

from aim._sdk.configs import get_aim_repo_name

from logging import getLogger

logger = getLogger(__name__)


def search_aim_repo(path) -> Tuple[Any, bool]:
    found = False
    path = os.path.abspath(path)
    while path:
        repo_path = os.path.join(path, get_aim_repo_name())
        if os.path.exists(repo_path) and os.path.isdir(repo_path):
            found = True
            return path, found
        if path == '/':
            return None, found
        path = os.path.dirname(path)


def clean_repo_path(repo_path: Union[str, pathlib.Path]) -> str:
    if isinstance(repo_path, pathlib.Path):
        repo_path = str(repo_path)

    if not isinstance(repo_path, str) or not repo_path:
        return ''

    repo_path = repo_path.strip().rstrip('/')

    if isinstance(repo_path, pathlib.Path):
        repo_path = str(repo_path)
    if repo_path == '.':
        return os.getcwd()
    if repo_path == '~':
        return os.path.expanduser('~')

    if repo_path.endswith(get_aim_repo_name()):
        repo_path = repo_path[:-len(get_aim_repo_name())]
    if repo_path.startswith('~'):
        repo_path = os.path.expanduser('~') + repo_path[1:]

    return os.path.abspath(repo_path)


def generate_hash(hash_length=24) -> str:
    return uuid.uuid4().hex[:hash_length]


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(tz=datetime.timezone.utc)


def utc_timestamp() -> float:
    return utc_now().timestamp()


def prune(repo):
    from tqdm import tqdm
    from collections.abc import MutableMapping

    def flatten(d, parent_path=None):
        if parent_path and not isinstance(parent_path, tuple):
            parent_path = (parent_path, )

        all_paths = set()
        for k, v in d.items():
            if k == '__example_type__':
                continue

            new_path = parent_path + (k,) if parent_path else (k, )
            all_paths.add(new_path)
            if isinstance(v, MutableMapping):
                all_paths.update(flatten(v, new_path))

        return all_paths

    # TODO: [MV] check paths
    subtrees_to_lookup = ('attrs', 'contexts')
    repo_meta_tree = repo._meta_tree

    # set of all repo paths that can be left dangling after run deletion
    repo_paths = set()
    for key in subtrees_to_lookup:
        try:
            repo_paths.update(flatten(repo_meta_tree.collect(key, strict=False), parent_path=(key,)))
        except KeyError:
            pass

    run_hashes = repo.container_hashes
    for run_hash in tqdm(run_hashes):
        # construct unique paths set for each run
        run_paths = set()
        run_meta_tree = repo._meta_tree.subtree(('chunks', run_hash))
        for key in subtrees_to_lookup:
            try:
                run_paths.update(flatten(run_meta_tree.collect(key, strict=False), parent_path=(key,)))
            except KeyError:
                pass

        # update repo_paths keeping the elements that were not found in run_paths
        repo_paths.difference_update(run_paths)

        # if no paths are left in repo_paths set, means that we have no orphan paths
        if not repo_paths:
            break

    # everything left in the `repo_paths` set is subject to be deleted
    if not repo_paths:
        logger.info('No orphan params were found')
        return

    # acquire index container to delete orphan paths
    index_tree = repo.storage_engine.tree(-1, 'meta', read_only=False)

    # start deleting with the deepest paths first to bypass the cases when parent path is deleted before the child
    for path in sorted(repo_paths, key=len, reverse=True):
        del index_tree[path]
