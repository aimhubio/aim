import os

import click

from aim.sdk.repo import Repo
from aim.sdk.utils import clean_repo_path


@click.command()
@click.option('--repo', required=False, type=click.Path(exists=True, file_okay=False, dir_okay=True, writable=True))
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
@click.option('-s', '--skip-if-exists', is_flag=True, help='Skip initialization if the repo already exists')
def init(repo, yes, skip_if_exists):
    """
    Initializes new repository in the --repo directory.
    Initializes new repository in the current working directory if --repo argument is not provided:
     - Creates .aim directory & runs upgrades for structured DB
    """
    repo_path = clean_repo_path(repo) or os.getcwd()
    re_init = False
    if Repo.exists(repo_path):
        if yes and skip_if_exists:
            raise click.BadParameter('Conflicting init options.' 'Either specify -y/--yes or -s/--skip-if-exists')
        elif yes:
            re_init = True
        elif skip_if_exists:
            click.echo('Repo exists at {}. Skipped initialization.'.format(repo_path))
            return
        else:
            re_init = click.confirm(
                'Aim repository is already initialized. ' 'Do you want to re-initialize to empty Aim repository?'
            )
        if not re_init:
            return
        # Clear old repo
        Repo.rm(repo_path)

    repo = Repo.from_path(repo_path, init=True)
    if re_init:
        click.echo('Re-initialized empty Aim repository at {}'.format(repo.root_path))
    else:
        click.echo('Initialized a new Aim repository at {}'.format(repo.root_path))
