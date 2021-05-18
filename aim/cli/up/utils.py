import sys
import os
import click


def repo_init_alert():
    click.echo('Repository not found')
    click.echo('    (use "aim init" to initialize a new repository)')


def build_db_upgrade_command():
    from aim import web
    python_exec = 'python{}.{}'.format(sys.version_info[0], sys.version_info[1])
    web_dir = os.path.dirname(web.__file__)
    manage_file = os.path.join(web_dir, 'manage.py')
    migrations_dir = os.path.join(web_dir, 'migrations')
    return [python_exec, manage_file,
            'db', 'upgrade', '--directory', migrations_dir]


def build_gunicorn_command(host, port, num_workers):
    bind_address = "%s:%s" % (host, port)
    return ['gunicorn',
            '-b', bind_address,
            '-w', '%s' % num_workers,
            # '--reload', 'true' if dev else 'false',
            '--log-level', 'error',
            'aim.web.run'
            ]
