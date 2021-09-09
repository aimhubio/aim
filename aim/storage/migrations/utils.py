import os
import subprocess

from aim.web.configs import AIM_ENV_MODE_KEY


def create_migration_cmd():
    from aim import storage
    storage_dir = os.path.dirname(storage.__file__)
    if os.getenv(AIM_ENV_MODE_KEY, 'prod') == 'prod':
        migrations_config = os.path.join(storage_dir, 'migrations', 'alembic.ini')
    else:
        migrations_config = os.path.join(storage_dir, 'migrations', 'alembic_dev.ini')
    cmd = ['alembic', '-c', migrations_config, 'upgrade', 'head']
    return cmd


def upgrade_database(db_url):
    migration_env = os.environ.copy()
    migration_env['AIM_RUN_META_DATA_DB_URL'] = db_url

    cmd = create_migration_cmd()

    migration_command = subprocess.Popen(cmd, env=migration_env, universal_newlines=True)
    migration_command.communicate()
    exit_code = migration_command.wait()
    if exit_code != 0:
        raise subprocess.SubprocessError(f'Database upgrade failed with exit code {exit_code}')

