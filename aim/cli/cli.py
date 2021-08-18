import click
from click import core

from aim.storage.sdk.repo import Repo

from aim.cli.configs import *
from aim.cli.init import commands as init_commands
from aim.cli.version import commands as version_commands
from aim.cli.up import commands as up_commands
from aim.cli.upgrade import commands as upgrade_commands

core._verify_python3_env = lambda: None


@click.group()
@click.option('-v', '--verbose', is_flag=True)
@click.pass_context
def cli_entry_point(ctx, verbose):
    if verbose:
        click.echo('Verbose mode is on')

    # Init repo instance
    # ctx.obj = Repo.default_repo()


cli_entry_point.add_command(init_commands.init, INIT_NAME)
cli_entry_point.add_command(version_commands.version, VERSION_NAME)
cli_entry_point.add_command(up_commands.up, UP_NAME)
cli_entry_point.add_command(upgrade_commands.upgrade, UPGRADE_NAME)
