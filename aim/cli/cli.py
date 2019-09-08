import click

from aim.engine.aim_repo import AimRepo

from .configs import *
from aim.cli.init import commands as init_commands
from aim.cli.remote import commands as remote_commands
from .push import commands as push_commands
from .deploy import commands as deploy_commands


@click.group()
@click.option('-v', '--verbose', is_flag=True)
@click.pass_context
def cli_entry_point(ctx, verbose):
    if verbose:
        click.echo('Verbose mode is on')

    # Init repo instance
    ctx.obj = AimRepo.get_working_repo()


cli_entry_point.add_command(init_commands.init, INIT_NAME)
cli_entry_point.add_command(remote_commands.entry_point, REMOTE_NAME)
cli_entry_point.add_command(push_commands.push, PUSH_NAME)
cli_entry_point.add_command(deploy_commands.deploy, DEPLOY_NAME)
