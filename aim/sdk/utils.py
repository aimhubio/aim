import os
import pathlib
import re
import uuid
from typing import Union
from aim.sdk.configs import get_aim_repo_name

from aim.storage.object import CustomObject


def search_aim_repo(path):
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


def generate_run_hash(hash_length=24):
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


def check_types_compatibility(dtype: str, base_dtype: str, update_base_dtype_fn=None) -> bool:
    if dtype == base_dtype:
        return True
    if base_dtype == 'list' and any_list_regex.match(dtype):
        if update_base_dtype_fn is not None:
            update_base_dtype_fn(dtype)
        return True
    if dtype == 'list' and any_list_regex.match(base_dtype):
        return True
    return False


def get_installed_packages():
    import pkg_resources
    packages = {i.key: i.version for i in pkg_resources.working_set}

    return packages


def get_environment_variables():
    env_mask = ('sec', 'key', 'tok', 'pwd', 'pass')
    env_vars = {
        k: v for k, v in os.environ.items() if next(
            (m for m in env_mask if m in k.lower()), None
        ) is None
    }

    return env_vars


def get_git_info():
    from subprocess import run

    git_info = {}
    r = run(['git', 'rev-parse', '--is-inside-work-tree'], capture_output=True, check=False)
    output = r.stdout.decode('utf-8').strip()
    if output == 'true':
        cmds = [
            'git rev-parse --abbrev-ref HEAD',
            'git log --pretty=format:%h/%ad/%an --date=iso-strict -1',
            'git config --get remote.origin.url'
        ]
        results = []
        for cmd in cmds:
            r = run(cmd.split(), capture_output=True, check=False)
            output = r.stdout.decode('utf-8').strip()
            results.append(output)

        branch_name = results[0]
        commit_hash, commit_timestamp, commit_author = results[1].split('/')
        git_remote_url = results[2]

        git_info.update({
            'branch': branch_name,
            'remote_origin_url': git_remote_url,
            'commit': {
                'hash': commit_hash,
                'timestamp': commit_timestamp,
                'author': commit_author
            }
        })

    return git_info
