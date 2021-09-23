import os
import pathlib
import platform
import shutil
import subprocess
import time
import uuid
from typing import Optional, Tuple, Union
import logging

logger = logging.getLogger(__name__)


def get_username():
    if os.environ.get('LOGNAME'):
        return os.environ.get('LOGNAME')
    if os.environ.get('LNAME'):
        return os.environ.get('LNAME')
    if os.environ.get('USER'):
        return os.environ.get('USER')
    if os.environ.get('USERNAME'):
        return os.environ.get('USERNAME')

    return None


def check_sshfs_installation():
    cmd = ['which', 'sshfs']
    child = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stdin=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
    )
    child.communicate()
    sshfs_executable = str(child.stdout)
    exit_code = child.wait()
    if exit_code != 0:
        if platform.system().lower() == 'darwin':
            raise subprocess.SubprocessError('Could not find sshfs installation. \n'
                                             'To install sshfs please run the following commands:\n'
                                             'brew install macfuse \n'
                                             'brew install brew install gromgit/fuse/sshfs\n'
                                             'or alternatively follow the instructions here:'
                                             'https://osxfuse.github.io/')
        else:
            raise subprocess.SubprocessError('Could not find sshfs installation. \n'
                                             'To install sshfs please run the following commands:\n'
                                             'apt-get update\n'
                                             'apt-get install sshfs')

    if not os.access(sshfs_executable, os.EX_OK):
        username = get_username()
        raise PermissionError(f'User {username} does not have sufficient permissions to run sshfs command.')


def check_directory_permissions(path: str, unmount: bool = False):
    if not os.access(path, os.W_OK):
        username = get_username()
        if unmount:
            unmount_remote_repo(path)
        raise PermissionError(f'User {username} does not have write permissions on path: {path}.')


def extract_remote_user_pwd_host_repo(path: str) -> Tuple[Optional[str], Optional[str], Optional[str], str]:
    # path should follow this format 'ssh://[user:password@][host]:remote_repo_path'
    assert path.startswith('ssh://')
    path = path[6:]

    initial_split = path.split('@', maxsplit=1)

    user = None
    password = None
    host = None

    if len(initial_split) == 1:
        user_pwd_split = None
        host_path_split = initial_split[0].split(':', maxsplit=1)
    else:
        host_path_split = initial_split[1].split(':', maxsplit=1)
        user_pwd_split = initial_split[0].split(':', maxsplit=1)

    if user_pwd_split:
        user = user_pwd_split[0]
        if len(user_pwd_split) > 1:
            password = user_pwd_split[1]

    if len(host_path_split) == 1:
        remote_path = host_path_split[0]
    else:
        host = host_path_split[0]
        remote_path = [1]

    # fallback to env variables
    if not user and os.environ.get('AIM_REMOTE_REPO_USER'):
        user = os.environ.get('AIM_REMOTE_REPO_USER')
    if not password and os.environ.get('AIM_REMOTE_REPO_PASSWORD'):
        password = os.environ.get('AIM_REMOTE_REPO_PASSWORD')
    if not host and os.environ.get('AIM_REMOTE_REPO_HOST'):
        host = os.environ.get('AIM_REMOTE_REPO_HOST')

    return user, password, host, remote_path


def mount_remote_repo(remote_path: str) -> str:
    check_sshfs_installation()

    user, pwd, host, remote_repo_path = extract_remote_user_pwd_host_repo(remote_path)

    check_directory_permissions(path='/tmp')
    mount_point = f'/tmp/{int(time.time())}/{remote_repo_path}'
    os.makedirs(mount_point, exist_ok=True)

    login_options = f'{host}:{remote_repo_path}'
    if user:
        if pwd:
            login_options = f'{user}:{pwd}@{login_options}'
        else:
            login_options = f'{user}@{login_options}'

    # TODO: experiment on sshfs options to find an optimal set
    sshfs_options = 'allow_other,default_permissions,nonempty'
    identity_file = os.environ.get('AIM_REMOTE_REPO_KEY_FILE')
    if identity_file:
        sshfs_options = f'{sshfs_options},IdentityFile={identity_file}'

    cmd = ['sshfs', '-o', sshfs_options, login_options, mount_point]
    child = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stdin=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
    )
    child.communicate()
    exit_code = child.wait()

    if exit_code != 0:
        shutil.rmtree(mount_point)
        raise subprocess.SubprocessError(f'Could not mount remote repository using command: \n'
                                         f'{" ".join(cmd)} \n'
                                         f'Please try to mount manually '
                                         f'and use the local mount point as a usual repo path.')

    check_directory_permissions(mount_point, unmount=True)

    return mount_point


def unmount_remote_repo(mount_point: str):
    cmd = ['umount', mount_point]
    child = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stdin=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
    )
    child.communicate()
    exit_code = child.wait()
    if exit_code != 0:
        logger.warning(f'Could not unmount path: {mount_point}.\n'
                       f'Please unmount manually using command:\n'
                       f'{" ".join(cmd)}')
    else:
        shutil.rmtree(mount_point)


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
