import os
import sys

from aim.web.configs import AIM_ENV_MODE_KEY


def build_db_upgrade_command():
    from aim import web
    web_dir = os.path.dirname(web.__file__)
    migrations_dir = os.path.join(web_dir, 'migrations')
    if os.getenv(AIM_ENV_MODE_KEY, 'prod') == 'prod':
        ini_file = os.path.join(migrations_dir, 'alembic.ini')
    else:
        ini_file = os.path.join(migrations_dir, 'alembic_dev.ini')
    return [sys.executable, '-m', 'alembic', '-c', ini_file, 'upgrade', 'head']


def build_uvicorn_command(host, port, num_workers, ssl_keyfile, ssl_certfile, log_level):
    cmd = [sys.executable, '-m', 'uvicorn',
           '--host', host, '--port', f'{port}',
           '--workers', f'{num_workers}']
    if os.getenv(AIM_ENV_MODE_KEY, 'prod') == 'prod':
        log_level = log_level or 'error'
    else:
        import aim
        cmd += ['--reload', '--reload-dir', os.path.dirname(aim.__file__)]
        log_level = log_level or 'debug'
    if ssl_keyfile:
        cmd += ['--ssl-keyfile', ssl_keyfile]
    if ssl_certfile:
        cmd += ['--ssl-certfile', ssl_certfile]
    cmd += ['--log-level', log_level.lower()]
    cmd += ['aim.web.run:app']
    return cmd
