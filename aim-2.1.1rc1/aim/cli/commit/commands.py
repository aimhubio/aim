import click
import time

from aim.engine.repo import AimRepo


@click.command()
@click.option('-m', '--message', default='', type=str)
@click.option('--code', is_flag=True)
@click.pass_obj
def commit(repo, message, code):
    if repo is None:
        click.echo('Repository does not exist')
        return

    commit_hash = AimRepo.generate_commit_hash()
    message = message.strip() or int(time.time())

    # Check if there is anything to commit
    if repo.is_index_empty():
        click.echo('Nothing to commit')
        return

    branch_name = branch_hash = None
    if code:
        try:
            from aim.version_control.factory import Factory
        except Exception:
            click.echo('Git executable not found')
            return

        vc = Factory.create(Factory.GIT)

        # Check if version control repo exists
        if vc is None or vc.get_repo() is None:
            click.echo('No git repository (or any parent up to mount ' +
                       'point /) found. Initialize git repository ' +
                       'by running `git init`')
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
                       'You do not have the git initial commit yet')
            return

        # Commit changes to a new created branch and return branch name
        branch_name, branch_hash = vc.commit_changes_to_branch(message,
                                                               commit_hash)

        # Get the latest branch
        latest_branch = repo.get_latest_vc_branch() or {}
        latest_branch = latest_branch.get('branch')
        if latest_branch is None:
            latest_branch = vc.get_head_hash()

        # Get diff between current commit and latest commit(or HEAD)
        diff = vc.get_diff_text(latest_branch, branch_name)
        repo.save_diff(diff)

    # Commit
    commit_res = repo.commit(commit_hash, message, branch_name, branch_hash)

    click.echo(click.style('[{b}/{c} commit]'.format(
        b=commit_res['branch'],
        c=commit_res['commit']), fg='yellow'))
    click.echo(message)
