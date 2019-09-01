import click
import os

from aim.init.repo import AimRepo


@click.command()
def push():
    # Get working directory path
    working_dir = os.environ['PWD']

    # Try to find closest .aim repository
    repo = None
    while True:
        if len(working_dir) <= 1:
            break

        repo = AimRepo(working_dir)
        if repo.exists():
            break
        else:
            repo = None
            working_dir = os.path.split(working_dir)[0]

    if repo is not None:
        click.echo('Found Aim repository at {}'.format(repo))
