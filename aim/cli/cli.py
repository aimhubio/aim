import click
from click import core

from aim.engine.repo import AimRepo

from aim.cli.configs import *
from aim.cli.init import commands as init_commands
from aim.cli.experiment import commands as experiment_commands
from aim.cli.version import commands as version_commands
from aim.cli.de import commands as de_commands
# from aim.cli.status import commands as status_commands
# from aim.cli.config import commands as config_commands
# from aim.cli.commit import commands as commit_commands
# from aim.cli.reset import commands as reset_commands

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
# cli_entry_point.add_command(commit_commands.commit, COMMIT_NAME)
# cli_entry_point.add_command(de_commands.de_entry_point, DE_NAME)
# cli_entry_point.add_command(status_commands.status, STATUS_NAME)
# cli_entry_point.add_command(reset_commands.reset, RESET_NAME)
# cli_entry_point.add_command(config_commands.config, CONFIG_NAME)

# Development environment management commands
cli_entry_point.add_command(de_commands.up, DE_UP_NAME)
cli_entry_point.add_command(de_commands.down, DE_DOWN_NAME)
cli_entry_point.add_command(de_commands.upgrade, DE_UPGRADE_NAME)
cli_entry_point.add_command(de_commands.pull, DE_PULL_NAME)
