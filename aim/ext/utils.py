import logging
import subprocess
from fastapi.responses import JSONResponse

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


async def http_exception_handler(request, exc):
    message = str(exc.detail)
    detail = None

    if isinstance(exc.detail, dict):
        message = exc.detail.pop('message', message)
        detail = exc.detail.pop('detail', None)

    response = {'message': message}
    if detail:
        response.update({'detail': detail})
    else:
        response.update({'detail': str(exc)})
    return JSONResponse(response, status_code=exc.status_code)


async def fallback_exception_handler(request, exc):
    response = {
        'message': f'\'{type(exc)}\' exception raised!',
        'detail': str(exc)
    }
    return JSONResponse(response, status_code=500)
