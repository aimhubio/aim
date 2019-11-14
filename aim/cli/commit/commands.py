import click
import uuid

from aim.engine.aim_repo import AimRepo
from aim.version_control.factory import Factory


@click.command()
@click.option('-m', '--message', required=True, type=str)
@click.pass_obj
def commit(repo, message):
    commit_id = str(uuid.uuid1())
    message = message.strip()

    vc = Factory.create(Factory.GIT)

    # Check whether version control repo exists
    if vc is None:
        click.echo('No git repository (or any parent up to mount point /) ' +
                   'found. Initialize git repository by running `git init`')
        return

    # Check untracked files
    if len(vc.get_untracked_files()):
        click.echo('You have untracked files, please add them to the ' +
                   'index before committing your changes by running ' +
                   '`git add -A`')
        return

    # Check if HEAD exists
    if not vc.get_head_hash():
        click.echo('Needed a single revision. ' +
                   'You do not have the git initial commit yet.')
        return

    # Commit changes to a new created branch and return branch name
    branch_name = vc.commit_changes_to_branch(message, commit_id)

    # Run aim commit
    repo.commit(commit_id)
