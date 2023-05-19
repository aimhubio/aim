import click
from click import core

from aimcore.cli.configs import *  # noqa F403
from aimcore.cli.init import commands as init_commands
from aimcore.cli.version import commands as version_commands
from aimcore.cli.up import commands as up_commands
from aimcore.cli.server import commands as server_commands
from aimcore.cli.telemetry import commands as telemetry_commands

core._verify_python3_env = lambda: None


@click.group()
@click.option('-v', '--verbose', is_flag=True)
def cli_entry_point(verbose):
    if verbose:
        click.echo('Verbose mode is on')


cli_entry_point.add_command(init_commands.init, INIT_NAME)
cli_entry_point.add_command(version_commands.version, VERSION_NAME)
cli_entry_point.add_command(up_commands.up, UP_NAME)
cli_entry_point.add_command(server_commands.server, SERVER_NAME)
cli_entry_point.add_command(telemetry_commands.telemetry)
