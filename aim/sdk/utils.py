import os
import pathlib
import uuid
from typing import Union


def search_aim_repo(path):
    found = False
    path = os.path.abspath(path)
    while path:
        repo_path = os.path.join(path, '.aim')
        if os.path.exists(repo_path) and os.path.isdir(repo_path):
            found = True
            return path, found
        if path == '/':
            return None, found
        path = os.path.dirname(path)


def generate_run_hash():
    return hex(hash(uuid.uuid4()))[2:9]


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

    if repo_path.endswith('.aim'):
        repo_path = repo_path[:-4]
    if repo_path.startswith('~'):
        repo_path = os.path.expanduser('~') + repo_path[1:]

    return os.path.abspath(repo_path)
