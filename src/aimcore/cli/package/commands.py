import click
import pathlib
import tabulate

from aim import Repo
from aim._sdk.package_utils import Package

from .utils import init_template, pyproject_toml_template, get_pkg_distribution_sources
from .watcher import PackageSourceWatcher


@click.group('packages')
def packages():
    """Manage Aim packages/apps."""


@packages.command('create')
@click.option('--name', '-n', required=True, type=str)
@click.option('--install', '-i', is_flag=True, default=False)
@click.option('--verbose', '-v', is_flag=True, default=False)
def create_package(name, install, verbose):
    """
    Create a new package with a specified name.

    :param name: Name of the new package to be created.
    :param install: Whether to install the created package using pip.
    :param verbose: Provide verbose output when installing the package.
    """

    pkg_dir = pathlib.Path(name)
    if pkg_dir.exists():
        click.echo(f'Cannot create package. Directory \'{name}\' already exists.')
        exit(1)
    try:
        package_categories = list({pkg.category for pkg in Package.pool.values()})
        package_categories.append('Other')
        description = click.prompt('Package description')
        author = click.prompt('Package author', default='unknown')

        def prompt_suffix():
            choices = '\n'.join([f'[{idx+1}] {cat}' for idx, cat in enumerate(package_categories)])
            return ':\n' + choices

        def process_value(val):
            val = int(val)
            if 1 < val <= len(package_categories):
                return package_categories[val-1]

        category = click.prompt('Select package category',
                                show_choices=False,
                                prompt_suffix=prompt_suffix(),
                                value_proc=process_value,
                                type=click.Choice(package_categories))
        if category == 'Other':
            category = click.prompt('Enter category name')
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
            fh.write(init_template.format(
                description=description,
                author=author,
                category=category
            ))

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


@packages.command('sync')
@click.option('--name', '-n', required=True, type=str)
@click.option('--repo', default='', type=str)
def sync_package(name, repo):
    """
    Synchronize a package with a specified Aim repository.

    :param name: Name of the package to be synchronized.
    :param repo: The Aim repository to sync with. If not provided, uses default.
    """

    try:
        src_path = get_pkg_distribution_sources(name)
        click.echo(f'Found sources for package \'{name}\'. Location: \'{src_path}\'.')
    except Exception as e:
        click.echo(f'Failed to find sources directory for package \'{name}\'.')
        click.secho(f'Reason: {e}', fg='yellow')
        exit(1)
    else:
        if repo and not Repo.is_remote_path(repo):
            click.echo('Failed to run package sync. \'--repo\' must point to Aim remote server path.')
            exit(1)
        repo_inst = Repo.from_path(repo) if repo else Repo.default()

        package_watcher = PackageSourceWatcher(repo_inst, name, src_path)
        package_watcher.initialize()
        package_watcher.start()


@packages.command('add')
@click.option('--name', '-n', required=True, type=str)
@click.option('--repo', default='', type=str)
def add_package(name, repo):
    """
    Add a package to a specified Aim repository.

    :param name: Name of the package to be added.
    :param repo: The Aim repository to add to. If not provided, uses default.
    """

    repo_inst = Repo.from_path(repo) if repo else Repo.default()
    if not repo_inst.add_package(pkg_name=name):
        click.secho(f'Package \'{name}\' is already listed in Repo \'{repo_inst.path}\'', err=True)
        exit(1)
    click.echo(f'Added package \'{name}\' to Repo \'{repo_inst.path}\'')


@packages.command('rm')
@click.option('--name', '-n', required=True, type=str)
@click.option('--repo', default='', type=str)
def remove_package(name, repo):
    """
    Remove a package from a specified Aim repository.

    :param name: Name of the package to be removed.
    :param repo: The Aim repository to remove from. If not provided, uses default.
    """

    repo_inst = Repo.from_path(repo) if repo else Repo.default()
    if not repo_inst.remove_package(pkg_name=name):
        click.secho(f'Package \'{name}\' is not listed in Repo \'{repo_inst.path}\'', err=True)
        exit(1)
    click.echo(f'Removed package \'{name}\' from Repo \'{repo_inst.path}\'')


@packages.command('ls')
@click.option('--repo', default='', type=str)
def list_packages(repo):
    """
    List all packages from a specified Aim repository.

    :param repo: Path to the repository. If not specified, the default repository is used.
    """

    repo_inst = Repo.from_path(repo) if repo else Repo.default()
    repo_inst.load_active_packages()
    pkg_infos = {attr_name: [] for attr_name in Package.attributes}
    for pkg in Package.pool.values():
        for attr_name in Package.attributes:
            pkg_infos[attr_name].append(getattr(pkg, attr_name))
    click.echo(tabulate.tabulate(pkg_infos, pkg_infos.keys(), tablefmt='psql'))
