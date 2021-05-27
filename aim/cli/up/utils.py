import sys
import os
import click

from aim.engine.configs import AIM_FLASK_ENV_KEY


def repo_init_alert():
    click.echo('Repository not found')
    click.echo('    (use "aim init" to initialize a new repository)')


def build_db_upgrade_command():
    from aim import web
    web_dir = os.path.dirname(web.__file__)
    manage_file = os.path.join(web_dir, 'manage.py')
    migrations_dir = os.path.join(web_dir, 'migrations')
    return [sys.executable, manage_file,
            'db', 'upgrade', '--directory', migrations_dir]


def build_gunicorn_command(host, port, num_workers):
    bind_address = "%s:%s" % (host, port)
    cmd = ['gunicorn', '-b', bind_address, '-w', '%s' % num_workers,
           '--timeout', '300', '--graceful-timeout', '300']
    if os.getenv(AIM_FLASK_ENV_KEY) == 'dev':
        cmd += ['--reload', '--log-level', 'info']
    else:
        cmd += ['--log-level', 'error']
    cmd += ['aim.web.run']
    return cmd
