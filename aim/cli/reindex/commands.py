import click

from aim.sdk.repo import Repo, RepoStatus
from aim.sdk.index_manager import RepoIndexManager
from aim.sdk.utils import clean_repo_path


@click.command()
@click.option('--repo', required=False, type=click.Path(exists=True,
                                                        file_okay=False,
                                                        dir_okay=True,
                                                        writable=True))
@click.option('--finalize-only', required=False, is_flag=True, default=False)
def reindex(repo, finalize_only):
    """
    Process runs left in 'in progress' state.
    """
    repo_path = clean_repo_path(repo) or Repo.default_repo_path()
    repo_status = Repo.check_repo_status(repo_path)
    if repo_status != RepoStatus.UPDATED:
        click.echo(f'\'{repo_path}\' is not updated. Cannot run indexing.')
    repo_inst = Repo.from_path(repo_path)
    index_mng = RepoIndexManager.get_index_manager(repo_inst.path)
    if finalize_only:
        if not index_mng.reindex_needed:
            click.echo('Index is up to date.')
            return
        confirmed = click.confirm(f'This command will try to finalize all stalled runs in aim repo located at '
                                  f'\'{repo_path}\'. Do you want to proceed?')
        if not confirmed:
            return
    else:
        confirmed = click.confirm(f'This command will try to reindex all runs in aim repo located at '
                                  f'\'{repo_path}\'. This process might take a while. Do you want to proceed?')
        if not confirmed:
            return

    index_mng.reindex()
    if not finalize_only:
        index_mng.run_flushes_and_compactions()
