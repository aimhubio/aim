import click
import os

from aim.sdk.repo import Repo


@click.command()
def init():
    """
    Initializes new repository in the current working directory:
     - Creates .aim directory & runs upgrades for structured DB
    """
    repo_path = os.getcwd()
    re_init = False
    if Repo.exists(repo_path):
        re_init = click.confirm('Aim repository is already initialized. '
                                'Do you want to re-initialize it?')
        if not re_init:
            return
        # Clear old repo
        Repo.rm(repo_path)

    repo = Repo.from_path(repo_path, init=True)
    repo.structured_db.run_upgrades()
    if re_init:
        click.echo(
            'Re-initialized empty Aim repository at {}'.format(repo.root_path))
    else:
        click.echo('Initialized a new Aim repository at {}'.format(repo.root_path))
