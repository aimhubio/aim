import sys
import os
import click

from aim.engine.configs import AIM_WEB_ENV_KEY


def repo_init_alert():
    click.echo('Repository not found')
    click.echo('    (use "aim init" to initialize a new repository)')


def build_db_upgrade_command():
    from aim import web
    web_dir = os.path.dirname(web.__file__)
    migrations_dir = os.path.join(web_dir, 'migrations')
    if os.getenv(AIM_WEB_ENV_KEY) == 'dev':
        ini_file = os.path.join(migrations_dir, 'alembic_dev.ini')
    else:
        ini_file = os.path.join(migrations_dir, 'alembic.ini')
    return ['alembic', '-c', ini_file, 'upgrade', 'head']


def build_hypercorn_command(host, port, num_workers):
    bind_address = "%s:%s" % (host, port)
    cmd = ['hypercorn', '-b', bind_address, '-w', '%s' % num_workers,
           '--graceful-timeout', '300']
    if os.getenv(AIM_WEB_ENV_KEY) == 'dev':
        cmd += ['--reload', '--log-level', 'info']
    else:
        cmd += ['--log-level', 'error']
    cmd += ['aim.web.run']
    return cmd
