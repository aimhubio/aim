import click

from aim.engine.aim_repo import AimRepo

from aim.cli.configs import *
from aim.cli.auth import commands as auth_commands
from aim.cli.init import commands as init_commands
from aim.cli.remote import commands as remote_commands
from aim.cli.push import commands as push_commands
from aim.cli.branch import commands as branch_commands
from aim.cli.commit import commands as commit_commands
from aim.cli.reset import commands as reset_commands
from aim.cli.version import commands as version_commands


@click.group()
@click.option('-v', '--verbose', is_flag=True)
@click.pass_context
def cli_entry_point(ctx, verbose):
    if verbose:
        click.echo('Verbose mode is on')

    # Init repo instance
    ctx.obj = AimRepo.get_working_repo()


cli_entry_point.add_command(auth_commands.auth, AUTH_NAME)
cli_entry_point.add_command(init_commands.init, INIT_NAME)
cli_entry_point.add_command(remote_commands.remote_entry_point, REMOTE_NAME)
cli_entry_point.add_command(branch_commands.branch_entry_point, BRANCH_NAME)
cli_entry_point.add_command(push_commands.push, PUSH_NAME)
cli_entry_point.add_command(commit_commands.commit, COMMIT_NAME)
cli_entry_point.add_command(reset_commands.reset, RESET_NAME)
cli_entry_point.add_command(version_commands.version, VERSION_NAME)
