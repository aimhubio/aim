import click
import pathlib

from aim import Repo
from .utils import init_template, pyproject_toml_template, get_pkg_distribution_sources
from .watcher import PackageSourceWatcher

@click.group('package')
def package():
    pass


@package.command('create')
@click.option('--name', '-n', required=True, type=str)
@click.option('--install', '-i', is_flag=True, default=False)
@click.option('--verbose', '-v', is_flag=True, default=False)
def create_package(name, install, verbose):
    pkg_dir = pathlib.Path(name)
    if pkg_dir.exists():
        click.echo(f'Cannot create package. Directory \'{name}\' already exists.')
        exit(1)
    try:
        pkg_dir.mkdir()

        # create source directories
        src_dir = pkg_dir / 'src' / name
        src_dir.mkdir(parents=True)

        models_dir = src_dir / 'models'
        models_dir.mkdir()
        (models_dir / '__init__.py').touch()

        boards_dir = src_dir / 'boards'
        boards_dir.mkdir()

        # create __init__.py
        init_file = src_dir / '__init__.py'
        with init_file.open('w+') as fh:
            fh.write(init_template)

        # create pyproject.toml
        pyproject_file = pkg_dir / 'pyproject.toml'
        with pyproject_file.open('w+') as fh:
            fh.write(pyproject_toml_template.format(name=name))
    except Exception as e:
        click.echo(f'Failed to create package \'{name}\'.')
        click.secho(f'Reason: {e}', fg='yellow')
        pkg_dir.rmdir()
        exit(1)
    else:
        click.echo(f'Successfully created Aim package \'{name}\'.')

    if install is True:
        try:
            click.echo('Installing package...')
            import subprocess
            from subprocess import PIPE
            if verbose:
                subprocess.run(['pip', 'install', '-e', name], stdout=None, stderr=None)
            else:
                subprocess.run(['pip', 'install', '-e', name], stdout=PIPE, stderr=PIPE)
        except Exception as e:
            click.echo(f'Failed to install package \'{name}\'.')
            click.secho(f'Reason: {e}', fg='yellow')
            exit(1)
        else:
            click.echo(f'Successfully installed Aim package \'{name}\'.')


@package.command('sync')
@click.option('--name', '-n', required=True, type=str)
@click.option('--repo', default='', type=str)
def sync_package(name, repo):
    try:
        src_path = get_pkg_distribution_sources(name)
        click.echo(f'Found sources for package \'{name}\'. Location: \'{src_path}\'.')
    except Exception as e:
        click.echo(f'Failed to find sources directory for package \'{name}\'.')
        click.secho(f'Reason: {e}', fg='yellow')
        exit(1)
    else:
        if repo and not Repo.is_remote_path(repo):
            click.echo(f'Failed to run package sync. \'--repo\' must point to Aim remote server path.')
            exit(1)
        repo_inst = Repo.from_path(repo) if repo else Repo.default()

        package_watcher = PackageSourceWatcher(repo_inst, name, src_path)
        package_watcher.initialize()
        package_watcher.start()
