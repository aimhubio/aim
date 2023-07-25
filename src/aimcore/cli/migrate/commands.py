import click
import pathlib
import shutil

from aim import Repo
from aim._sdk.configs import get_aim_repo_name, get_data_version
from aimcore.cli.migrate import utils


@click.command('migrate')
@click.option('--repo', required=True, type=click.Path(exists=True,
                                                       file_okay=False,
                                                       dir_okay=True,
                                                       writable=True))
@click.option('--run', required=False, type=str, default=None)
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
def migrate(repo, run, yes):
    data_version = Repo.get_version(repo)
    if data_version is None:
        click.secho(f'Cannot run migration for directory \'{repo}\'. Data version is unknown.')
        exit(1)
    elif data_version == get_data_version():
        click.secho(f'Aim Repo \'{repo}\' is already up-to-date. Skipping.')
        exit(0)
    repo_path = pathlib.Path(repo)
    aim_dir_path = repo_path / get_aim_repo_name()
    aim_v3_dir_path = repo_path / f'{get_aim_repo_name()}_v3'
    if data_version[0] == 1:
        if yes or click.confirm(f'This command will convert Aim Runs at \'{repo}\' to a new format. '
                                f'This might take a while. Would you like to continue?'):
            shutil.move(aim_dir_path, aim_v3_dir_path)
            try:
                Repo.init(repo)
                repo_inst = Repo.from_path(repo, read_only=False)
                utils.migrate_data_v3_v4(repo_inst, aim_v3_dir_path, run_hash=run)
            except Exception as e:
                shutil.rmtree(aim_dir_path)
                click.secho(f'Failed to migrate Aim repo \'{repo}\'. Reason: {e}.')
                click.secho(f'Old repository backup is available at \'{aim_v3_dir_path}\'.')
                raise
            else:
                click.secho(f'Successfully migrated Aim repo \'{repo}\'.')
                click.secho(f'Old repository backup is available at \'{aim_v3_dir_path}\'.')
