import click

from aim.__version__ import __version__ as aim_version


@click.command()
def version():
    click.echo('Aim v{}'.format(aim_version))
