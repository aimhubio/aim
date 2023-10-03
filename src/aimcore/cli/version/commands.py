
import click

from aim.__version__ import __version__ as aim_version


@click.command('version')
def version():
    """
    Prints version of installed Aim and exists.
    """
    click.echo('Aim v{}'.format(aim_version))
