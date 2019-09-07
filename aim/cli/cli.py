import click

from .configs import *
from .init import commands as init_commands
from .remote import commands as remote_commands
from .push import commands as push_commands
from .deploy import commands as deploy_commands


@click.group()
@click.option('-v', '--verbose', is_flag=True)
def cli_entry_point(verbose):
    if verbose:
        click.echo('Verbose mode is on')


cli_entry_point.add_command(init_commands.init, INIT_NAME)
cli_entry_point.add_command(remote_commands.entry_point, REMOTE_NAME)
cli_entry_point.add_command(push_commands.push, PUSH_NAME)
cli_entry_point.add_command(deploy_commands.deploy, DEPLOY_NAME)
