import os
import shutil
import tarfile
import pathlib
import re
import uuid
from contextlib import contextmanager
from typing import Union, Any, Tuple, Optional, Callable

from aim.sdk.configs import get_aim_repo_name

from aim.storage.object import CustomObject
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


def generate_run_hash(hash_length=24) -> str:
    return uuid.uuid4().hex[:hash_length]


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


def get_object_typename(obj) -> str:
    if isinstance(obj, float):
        return 'float'
    if isinstance(obj, (int, bool)):
        return 'int'
    if isinstance(obj, str):
        return 'str'
    if isinstance(obj, bytes):
        return 'bytes'
    if isinstance(obj, dict):
        return 'object'
    if isinstance(obj, (tuple, list)):
        if len(obj) == 0:
            # element type is unknown yet.
            return 'list'
        element_typename = get_object_typename(obj[0])
        return f'list({element_typename})'
    if isinstance(obj, CustomObject):
        return obj.get_typename()
    return 'unknown'


any_list_regex = re.compile(r'list\([A-Za-z]{1}[A-Za-z0-9.]*\)')


def check_types_compatibility(
        dtype: str,
        base_dtype: str,
        update_base_dtype_fn: Optional[Callable[[str, str], None]] = None) -> bool:
    if dtype == base_dtype:
        return True
    if base_dtype == 'number' and dtype in {'int', 'float'}:
        return True
    if {dtype, base_dtype} == {'int', 'float'}:
        if update_base_dtype_fn is not None:
            update_base_dtype_fn(base_dtype, 'number')
        return True
    if base_dtype == 'list' and any_list_regex.match(dtype):
        if update_base_dtype_fn is not None:
            update_base_dtype_fn(base_dtype, dtype)
        return True
    if dtype == 'list' and any_list_regex.match(base_dtype):
        return True
    return False


@contextmanager
def work_directory(path: str):
    curr = os.getcwd()
    try:
        os.chdir(path)
        yield
    finally:
        os.chdir(curr)


def backup_run(repo, run_hash) -> str:
    assert not repo.is_remote_repo
    repo_path = repo.path
    backups_dir = os.path.join(repo_path, 'bcp')
    if not os.path.exists(backups_dir):
        os.mkdir(backups_dir)

    run_bcp_file = f'bcp/{run_hash}'
    with work_directory(repo_path):
        with tarfile.open(run_bcp_file, 'w:gz') as tar:
            for part in ('meta', 'seqs'):
                tar.add(os.path.join(part, 'chunks', run_hash))
    return run_bcp_file


def restore_run_backup(repo, run_hash):
    assert not repo.is_remote_repo
    repo_path = repo.path
    backups_dir = os.path.join(repo_path, 'bcp')

    assert os.path.exists(backups_dir)
    with work_directory(repo_path):
        run_bcp_file = f'bcp/{run_hash}'
        shutil.rmtree(f'meta/chunks/{run_hash}', ignore_errors=True)
        shutil.rmtree(f'seqs/chunks/{run_hash}', ignore_errors=True)
        with tarfile.open(run_bcp_file, 'r:gz') as tar:
            tar.extractall()
        progress_path = pathlib.Path('meta') / 'progress' / run_hash
        progress_path.touch(exist_ok=True)


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

    subtrees_to_lookup = ('attrs', 'traces_types', 'contexts', 'traces')
    repo_meta_tree = repo._get_meta_tree()

    # set of all repo paths that can be left dangling after run deletion
    repo_paths = set()
    for key in subtrees_to_lookup:
        try:
            repo_paths.update(flatten(repo_meta_tree.collect(key, strict=False), parent_path=(key,)))
        except KeyError:
            pass

    run_hashes = repo.list_all_runs()
    for run_hash in tqdm(run_hashes):
        # construct unique paths set for each run
        run_paths = set()
        run_meta_tree = repo.request_tree('meta', run_hash, from_union=False, read_only=True).subtree('meta')
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
    index_tree = repo._get_index_tree('meta', timeout=5).subtree('meta')

    # start deleting with the deepest paths first to bypass the cases when parent path is deleted before the child
    for path in sorted(repo_paths, key=len, reverse=True):
        del index_tree[path]
