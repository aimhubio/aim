import click
from click import core

from aim.engine.repo import AimRepo

from aim.cli.configs import *
from aim.cli.init import commands as init_commands
from aim.cli.experiment import commands as experiment_commands
from aim.cli.version import commands as version_commands
from aim.cli.up import commands as up_commands

core._verify_python3_env = lambda: None


@click.group()
@click.option('-v', '--verbose', is_flag=True)
@click.pass_context
def cli_entry_point(ctx, verbose):
    if verbose:
        click.echo('Verbose mode is on')

    # Init repo instance
    ctx.obj = AimRepo.get_working_repo()


cli_entry_point.add_command(init_commands.init, INIT_NAME)
cli_entry_point.add_command(experiment_commands.exp_entry_point,
                            EXPERIMENT_NAME)
cli_entry_point.add_command(version_commands.version, VERSION_NAME)
cli_entry_point.add_command(up_commands.up, UP_NAME)
