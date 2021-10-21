import os
import click
import filelock

from aim.sdk.repo import Repo, RepoStatus
from aim.sdk.run import Run
from aim.sdk.utils import clean_repo_path


@click.command()
@click.option('--repo', required=False, type=click.Path(exists=True,
                                                        file_okay=False,
                                                        dir_okay=True,
                                                        writable=True))
def reindex(repo):
    """
    Process runs left in 'in progress' state.
    """
    repo_path = clean_repo_path(repo) or Repo.default_repo_path()
    repo_status = Repo.check_repo_status(repo_path)
    if repo_status != RepoStatus.UPDATED:
        click.echo(f'\'{repo_path}\' is not updated. Cannot run indexing.')
    repo_inst = Repo.from_path(repo_path)

    unindexed_runs_dir = os.path.join(repo_inst.path, 'meta', 'progress')
    runs_to_index = os.listdir(unindexed_runs_dir)
    if not runs_to_index:
        click.echo('Index is up to date.')
        return
    confirmed = click.confirm(f'This command will try to finalize all pending runs in aim repo located at '
                              f'\'{repo_path}\'. Do you want to proceed?')
    if not confirmed:
        return
    runs_in_progress = []
    for run_hash in runs_to_index:
        try:
            run = Run(run_hash=run_hash, repo=repo_inst, system_tracking_interval=None)
        except filelock.Timeout:
            runs_in_progress.append(run_hash)
        else:
            # TODO: [AT] handle lock timeout on index db (retry logic).
            run.finalize()
    if runs_in_progress:
        click.echo('Skipped indexing for the following runs in progress:')
        for run_hash in runs_in_progress:
            click.secho(f'\t\'{run_hash}\'', fg='yellow')
