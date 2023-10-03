import click
from click import core, Group

from aimcore.cli.init import commands as init_commands
from aimcore.cli.version import commands as version_commands
from aimcore.cli.ui import commands as ui_commands
from aimcore.cli.server import commands as server_commands
from aimcore.cli.telemetry import commands as telemetry_commands
from aimcore.cli.package import commands as package_commands
from aimcore.cli.conatiners import commands as container_commands
from aimcore.cli.migrate import commands as migrate_commands

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from click import Context

core._verify_python3_env = lambda: None


class CommandOrderedGroup(Group):
    def get_help(self, ctx: 'Context') -> str:
        ctx.terminal_width = 120
        return super().get_help(ctx)

    def list_commands(self, ctx: 'Context'):
        # Return commands in the order of their definition
        return self.commands


@click.group(cls=CommandOrderedGroup)
def cli_entry_point():
    """
    The main entry point for Aim CLI: a toolset for tracking and managing machine learning experiments.

    The Aim CLI provides a suite of commands to facilitate the tracking, visualization,
    and management of machine learning experiments. The toolset is designed to seamlessly
    integrate with various stages of the ML workflow, from initializing repositories and
    tracking experiments in real-time, to visualizing results through the UI and managing
    custom packages or apps.
    """


cli_entry_point.add_command(init_commands.init)
cli_entry_point.add_command(server_commands.server)
cli_entry_point.add_command(ui_commands.ui)
cli_entry_point.add_command(ui_commands.up)
cli_entry_point.add_command(package_commands.packages)
cli_entry_point.add_command(package_commands.packages, name='apps')
cli_entry_point.add_command(container_commands.containers)
cli_entry_point.add_command(migrate_commands.migrate)
cli_entry_point.add_command(version_commands.version)
cli_entry_point.add_command(telemetry_commands.telemetry)
