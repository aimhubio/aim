import click
from click import core

from aimcore.cli.init import commands as init_commands
from aimcore.cli.version import commands as version_commands
from aimcore.cli.up import commands as up_commands
from aimcore.cli.server import commands as server_commands
from aimcore.cli.telemetry import commands as telemetry_commands
from aimcore.cli.package import commands as package_commands
from aimcore.cli.migrate import commands as migrate_commands

core._verify_python3_env = lambda: None


@click.group()
def cli_entry_point():
    pass


cli_entry_point.add_command(init_commands.init)
cli_entry_point.add_command(version_commands.version)
cli_entry_point.add_command(up_commands.up)
cli_entry_point.add_command(server_commands.server)
cli_entry_point.add_command(telemetry_commands.telemetry)
cli_entry_point.add_command(package_commands.package)
cli_entry_point.add_command(migrate_commands.migrate)
