import logging
import re
import subprocess

from functools import lru_cache

from fastapi.responses import JSONResponse


logger = logging.getLogger(__name__)


def _get_installed_distributions():
    try:
        from importlib import metadata as metadata_module
    except ImportError:
        import importlib_metadata as metadata_module  # Python 3.7 support

    return metadata_module.distributions()


# Installed distributions normally do not change while the current Python process is running.
@lru_cache(maxsize=1)
def _collect_installed_package_versions():
    installed_package_versions = {}

    for installed_distribution in _get_installed_distributions():
        distribution_metadata = installed_distribution.metadata
        package_name = distribution_metadata.get('Name')
        package_version = distribution_metadata.get('Version')

        if not package_name or not package_version:
            continue

        # Preserve the normalized key format previously provided by pkg_resources.
        normalized_package_name = re.sub(
            r'[^A-Za-z0-9.]+',
            '-',
            package_name,
        ).lower()

        installed_package_versions.setdefault(normalized_package_name, package_version)

    return installed_package_versions


def get_installed_packages():
    # Return a copy so callers cannot modify the cached package information.
    return _collect_installed_package_versions().copy()


def get_environment_variables():
    from os import environ

    env_mask = ('secret', 'key', 'token', 'password')
    env_vars = {k: v for k, v in environ.items() if next((m for m in env_mask if m in k.lower()), None) is None}

    return env_vars


def get_git_info():
    git_info = {}
    try:
        r = subprocess.run(
            ['git', 'rev-parse', '--is-inside-work-tree'], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=True
        )
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

    git_info.update(
        {
            'branch': results.get('branch'),
            'remote_origin_url': results.get('remote_origin_url'),
            'commit': {'hash': commit_hash, 'timestamp': commit_timestamp, 'author': commit_author},
        }
    )

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
    response = {'message': f"'{type(exc)}' exception raised!", 'detail': str(exc)}
    return JSONResponse(response, status_code=500)
