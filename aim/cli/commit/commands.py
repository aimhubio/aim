import click

from aim.engine.aim_repo import AimRepo


@click.command()
@click.option('-m', '--message', required=True, type=str)
@click.pass_obj
def commit(repo, message):
    pass
