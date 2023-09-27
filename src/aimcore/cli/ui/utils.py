import os
import sys

from aim._sdk.configs import AIM_ENV_MODE_KEY


def build_db_upgrade_command():
    from aimcore import web
    web_dir = os.path.dirname(web.__file__)
    migrations_dir = os.path.join(web_dir, 'migrations')
    if os.getenv(AIM_ENV_MODE_KEY, 'prod') == 'prod':
        ini_file = os.path.join(migrations_dir, 'alembic.ini')
    else:
        ini_file = os.path.join(migrations_dir, 'alembic_dev.ini')
    return [sys.executable, '-m', 'alembic', '-c', ini_file, 'upgrade', 'head']
