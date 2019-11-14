import click
import uuid

from aim.engine.aim_repo import AimRepo
from aim.version_control.factory import Factory


@click.command()
@click.option('-m', '--message', required=True, type=str)
@click.pass_obj
def commit(repo, message):
    message = message.strip()

    # Get Git adapter
    vc = Factory.create(Factory.GIT)

    # Check if there are any untracked files
    untracked_files = vc.get_untracked_files()
    if len(untracked_files):
        click.echo('You have untracked files, please add them to the ' +
                   'index before committing your changes. ' +
                   'Simply run `git add -A`')
        return

    # Commit changes to a new created branch and return branch name
    branch_name = vc.commit_changes_to_branch(message, uuid.uuid1())
