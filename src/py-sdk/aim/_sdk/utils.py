import datetime
import os
import pathlib
import uuid
import pytz

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
    return datetime.datetime.now(pytz.utc)


def utc_timestamp() -> float:
    return utc_now().timestamp()
