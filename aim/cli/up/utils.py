import os

from aim.web.configs import AIM_WEB_ENV_KEY


def build_db_upgrade_command():
    from aim import web
    web_dir = os.path.dirname(web.__file__)
    migrations_dir = os.path.join(web_dir, 'migrations')
    if os.getenv(AIM_WEB_ENV_KEY) == 'prod':
        ini_file = os.path.join(migrations_dir, 'alembic.ini')
    else:
        ini_file = os.path.join(migrations_dir, 'alembic_dev.ini')
    return ['alembic', '-c', ini_file, 'upgrade', 'head']


def build_uvicorn_command(host, port, num_workers):
    cmd = ['uvicorn', '--host', host, '--port', '%s' % port, '--workers', '%s' % num_workers]
    if os.getenv(AIM_WEB_ENV_KEY) == 'prod':
        cmd += ['--log-level', 'error']
    else:
        import aim
        cmd += ['--reload', '--reload-dir', os.path.dirname(aim.__file__), '--log-level', 'debug']
    cmd += ['aim.web.run:app']
    return cmd
