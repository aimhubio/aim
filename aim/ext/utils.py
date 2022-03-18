import logging
import subprocess

logger = logging.getLogger(__name__)


def get_installed_packages():
    import pkg_resources
    packages = {i.key: i.version for i in pkg_resources.working_set}

    return packages


def get_environment_variables():
    from os import environ

    env_mask = ('secret', 'key', 'token', 'password')
    env_vars = {
        k: v for k, v in environ.items() if next(
            (m for m in env_mask if m in k.lower()), None
        ) is None
    }

    return env_vars


def get_git_info():
    git_info = {}
    try:
        r = subprocess.run(['git', 'rev-parse', '--is-inside-work-tree'],
                           stdout=subprocess.PIPE,
                           stderr=subprocess.STDOUT,
                           check=True)
    except subprocess.CalledProcessError:
        # not a git repo
        return git_info
    else:
        output = r.stdout.decode('utf-8').strip().lower()
        if output != 'true':
            # malformed result
            return git_info

    cmds = (
        ('git', 'rev-parse', '--abbrev-ref', 'HEAD'),
        ('git', 'config', '--get', 'remote.origin.url'),
        ('git', 'log', '--pretty=format:%h/%ad/%an', '--date=iso-strict', '-1'),
    )
    results = []
    for cmd in cmds:
        try:
            r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=True)
        except subprocess.CalledProcessError:
            logger.warning('Something went wrong while collecting git info. Will skip this step.')
            break
        else:
            output = r.stdout.decode('utf-8').strip()
            results.append(output)
    else:
        branch_name = results[0]
        git_remote_url = results[1]
        try:
            commit_hash, commit_timestamp, commit_author = results[2].split('/')
        except ValueError:
            commit_hash = commit_timestamp = commit_author = None

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
