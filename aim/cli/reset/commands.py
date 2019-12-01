import os
import click

from aim.engine.aim_profile import AimProfile


@click.command()
@click.pass_obj
def reset(repo):
    if repo is None:
        click.echo('Repository does not exist')
        return

    reset_check = click.confirm('Are you sure you want to reset your ' +
                                'experiment? You will lose all your ' +
                                'uncommitted data')

    if reset_check:
        repo.reset_index()
        click.echo('Successful reset')
