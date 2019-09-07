import click
import os

from aim.engine.aim_repo import AimRepo


@click.command()
def init():
    # Get working directory path
    curr_dir = os.environ['PWD']

    # Init repo instance
    repo = AimRepo(curr_dir)

    # Check whether repo already exists
    if repo.exists():
        re_init = click.confirm('Aim repository is already initialized. Do you want to re-initialize it?')
        if re_init:
            # Reinitialize repo -> clear old one and init empty repo
            repo.rm()
            if repo.init():
                click.echo('Re-initialized empty Aim repository in {}'.format(repo))
        return

    if repo.init():
        click.echo('Initialized empty Aim repository in {}'.format(repo))
