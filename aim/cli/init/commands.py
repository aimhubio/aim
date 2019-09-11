import click
import os

from aim.engine.aim_repo import AimRepo


@click.command()
@click.pass_obj
def init(repo):
    # Check whether repo already exists
    if repo is not None:
        re_init = click.confirm('Aim repository is already initialized. ' +
                                'Do you want to re-initialize it?')
        if not re_init:
            return

        # Reinitialize repo -> clear old one and init empty repo
        repo.rm()
        if repo.init():
            click.echo('Re-initialized empty Aim repository in {}'.format(repo))
        return

    repo = AimRepo(os.environ['PWD'])
    if repo.init():
        click.echo('Initialized empty Aim repository in {}'.format(repo))
