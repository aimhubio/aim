import os
import platform
import shutil
import subprocess
import time
import logging

from typing import Optional, Tuple

logger = logging.getLogger(__name__)


def get_username():
    """
    Utility function to retrieve the current username
    """
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
    """
    Utility function to check sshfs installation and user permission to execute sshfs.
    Raises errors with hints to install sshfs based on the platform
    """
    sshfs_executable = shutil.which('sshfs')
    if not sshfs_executable:
        if platform.system().lower() == 'darwin':
            raise subprocess.SubprocessError('Could not find sshfs installation. \n'
                                             'To install sshfs please run the following commands:\n'
                                             'brew install macfuse \n'
                                             'brew install gromgit/fuse/sshfs\n'
                                             'or alternatively follow the instructions here:'
                                             'https://osxfuse.github.io/')
        else:
            raise subprocess.SubprocessError('Could not find sshfs installation. \n'
                                             'To install sshfs please run the following commands:\n'
                                             'apt-get update\n'
                                             'apt-get install sshfs')

    # check user permission to execute sshfs
    if not os.access(sshfs_executable, os.EX_OK):
        username = get_username()
        raise PermissionError(f'User {username} does not have sufficient permissions to run sshfs command.')


def check_directory_permissions(path: str, mount_root: Optional[str] = '', unmount: bool = False):
    """
    Utility function to check user write permissions on given path.
    Optionally can unmount the the given path.
    """
    if not os.access(path, os.W_OK):
        username = get_username()
        if unmount:
            unmount_remote_repo(path, mount_root)
        raise PermissionError(f'User {username} does not have write permissions on path: {path}.')


def extract_remote_user_pwd_host_repo(path: str) -> Tuple[Optional[str], Optional[str], Optional[str], str]:
    """
    Utility function to extract user, password, host and remote repo path from given remote path.
    Arg path should follow the following format: 'ssh://[user:password@][host]:remote_repo_path'
    Falls back to environment variables if some of the extractables are missing
    """
    assert path.startswith('ssh://')
    # strip the 'ssh://' prefix
    path = path[6:]

    # split user:password and host:remote_repo_path pairs
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

    # split user and password
    if user_pwd_split:
        user = user_pwd_split[0]
        if len(user_pwd_split) > 1:
            password = user_pwd_split[1]

    # split host and remote path
    if len(host_path_split) == 1:
        remote_path = host_path_split[0]
    else:
        host = host_path_split[0]
        remote_path = host_path_split[1]

    # fallback to env variables
    if not user and os.environ.get('AIM_REMOTE_REPO_USER'):
        user = os.environ.get('AIM_REMOTE_REPO_USER')
    if not password and os.environ.get('AIM_REMOTE_REPO_PASSWORD'):
        password = os.environ.get('AIM_REMOTE_REPO_PASSWORD')
    if not host and os.environ.get('AIM_REMOTE_REPO_HOST'):
        host = os.environ.get('AIM_REMOTE_REPO_HOST')

    return user, password, host, remote_path


def mount_remote_repo(remote_path: str) -> Tuple[str, str]:
    """
    Utility function to mount remote repository path to local  '/tmp/<timestamp>/<remote_repo_name>' directory
    """

    check_sshfs_installation()

    user, pwd, host, remote_repo_path = extract_remote_user_pwd_host_repo(remote_path)

    # check if the current user has permissions to perform write operations on /tmp dir
    check_directory_permissions(path='/tmp')
    mount_root = f'/tmp/{int(time.time())}'
    mount_point = f'{mount_root}/{remote_repo_path}'
    os.makedirs(mount_point, exist_ok=True)

    login_options = f'{host}:{remote_repo_path}'
    if user:
        if pwd:
            login_options = f'{user}:{pwd}@{login_options}'
        else:
            login_options = f'{user}@{login_options}'

    # TODO: experiment on sshfs options to find an optimal set
    # construct sshfs options, use IdentityFile if provided by the user
    sshfs_options = 'default_permissions'
    identity_file = os.environ.get('AIM_REMOTE_REPO_KEY_FILE')
    if identity_file:
        sshfs_options = f'{sshfs_options},IdentityFile={identity_file}'

    # try mounting using sshfs
    cmd = ['sshfs', login_options, mount_point, '-o', sshfs_options]
    sshfs_process = subprocess.Popen(cmd, stderr=subprocess.PIPE)
    # redirect sdterr to pipe and check if errors occurred, if not let the sshfs process run in the background
    # otherwise raise an error, kill the process and cleanup the local mount point
    if sshfs_process.stderr.readline():
        # if mounting fails remove local mount point created by Aim
        # and print the command that was used, so it'll be easier for the user to perform manual mounting
        sshfs_process.wait()
        unmount_remote_repo(mount_point, mount_root)
        raise subprocess.SubprocessError(f'Could not mount remote repository using command: \n'
                                         f'{" ".join(cmd)} \n'
                                         f'Please try to mount manually '
                                         f'and use the local mount point as a usual repo path.')

    # check if the user has permissions to perform write operations on local mount point (which means that the
    # remote user also can perform write operations on remote repo path as well)
    # unmount the local mount point in case of failure
    check_directory_permissions(mount_point, mount_root, unmount=True)

    return mount_root, mount_point


def unmount_remote_repo(mount_point: str, mount_root: str):
    """
    Utility function to unmount remote repo and cleanup local directories created by Aim for mounting
    """

    # TODO: [MV] this is experimental
    # TODO: [MV] decide later what to do with unmounting remote repo
    if not os.path.exists(mount_point):
        return

    if not os.path.ismount(mount_point):
        shutil.rmtree(mount_root)
        return

    # force unmount the remote path as we are sure we've done everything we need up until to this point
    # and don't want to get stopped by any other processes stopping from unmounting
    umount_executable = shutil.which('umount')
    cmd = [umount_executable, mount_point]
    child = subprocess.Popen(
        cmd,
    )
    child.communicate()
    exit_code = child.wait()
    if exit_code != 0:
        # in case of failure log warning so the user can unmount manually if needed
        logger.warning(f'Could not unmount path: {mount_point}.\n'
                       f'Please unmount manually using command:\n'
                       f'{" ".join(cmd)}')
    else:
        shutil.rmtree(mount_root)
