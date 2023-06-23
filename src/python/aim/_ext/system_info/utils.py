import logging
import subprocess
import sys

logger = logging.getLogger(__name__)


def get_installed_packages():
    import importlib_metadata
    packages = {pkg.name: pkg.version for pkg in importlib_metadata.distributions()}

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
    except (subprocess.CalledProcessError, FileNotFoundError):
        # not a git repo
        return git_info
    else:
        output = r.stdout.decode('utf-8').strip().lower()
        if output != 'true':
            # malformed result
            return git_info

    cmds = {
        'branch': ('git', 'rev-parse', '--abbrev-ref', 'HEAD'),
        'remote_origin_url': ('git', 'config', '--get', 'remote.origin.url'),
        'commit': ('git', 'log', '--pretty=format:%h/%ad/%an', '--date=iso-strict', '-1'),
    }
    results = {}
    for key, cmd in cmds.items():
        try:
            r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=True)
        except subprocess.CalledProcessError:
            continue
        else:
            output = r.stdout.decode('utf-8').strip()
            results[key] = output

    try:
        commit_hash, commit_timestamp, commit_author = results.get('commit').split('/')
    except (ValueError, AttributeError):
        commit_hash = commit_timestamp = commit_author = None

    git_info.update({
        'branch': results.get('branch'),
        'remote_origin_url': results.get('remote_origin_url'),
        'commit': {
            'hash': commit_hash,
            'timestamp': commit_timestamp,
            'author': commit_author
        }
    })

    return git_info


def get_executable():
    return sys.executable


def get_exec_args():
    return sys.argv
