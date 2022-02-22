from subprocess import run, PIPE


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
    r = run(['git', 'rev-parse', '--is-inside-work-tree'], stdout=PIPE, stderr=PIPE, check=False)
    output = r.stdout.decode('utf-8').strip()
    if output == 'true':
        cmds = [
            'git rev-parse --abbrev-ref HEAD',
            'git log --pretty=format:%h/%ad/%an --date=iso-strict -1',
            'git config --get remote.origin.url'
        ]
        results = []
        for cmd in cmds:
            r = run(cmd.split(), stdout=PIPE, stderr=PIPE, check=False)
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
