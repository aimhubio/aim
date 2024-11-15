import os

import click

from aim.cli.runs.utils import match_runs
from aim.sdk.index_manager import RepoIndexManager
from aim.sdk.maintenance_run import MaintenanceRun as Run
from aim.sdk.repo import Repo
from aim.sdk.utils import backup_run, restore_run_backup
from tqdm import tqdm


@click.group()
@click.option('--repo', required=False, default=os.getcwd(), type=str)
@click.pass_context
def storage(ctx, repo):
    """Manage aim repository data & format updates."""
    ctx.ensure_object(dict)
    ctx.obj['repo'] = repo


@storage.group()
@click.pass_context
def upgrade(ctx):
    """Update Runs data for given run hashes to use new format."""
    pass


@upgrade.command(name='3.11+')
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
def to_3_11(ctx, hashes, yes):
    """Optimize Runs Metrics data for read access."""
    if len(hashes) == 0:
        click.echo('Please specify at least one Run to update.')
        exit(1)
    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)

    matched_hashes = match_runs(repo, hashes)
    remaining_runs = []
    if yes:
        confirmed = True
    else:
        confirmed = click.confirm(
            f'This command will optimize the metrics data for {len(matched_hashes)} '
            f"runs from aim repo located at '{repo_path}'. This process might take a while. "
            f'Do you want to proceed?'
        )
    if not confirmed:
        return

    index_manager = RepoIndexManager.get_index_manager(repo)
    for run_hash in tqdm(matched_hashes):
        try:
            run = Run(run_hash, repo=repo)
            if run.check_metrics_version():
                backup_run(run)
                run.update_metrics()
                index_manager.index(run_hash)
            else:
                click.echo(f'Run {run.hash} is already up to date. Skipping')
        except Exception:
            remaining_runs.append(run_hash)

    if not remaining_runs:
        click.echo('Finished optimizing metric data.')
    else:
        click.echo('Finished optimizing metric data. The following runs were skipped:')
        click.secho(' '.join(remaining_runs), fg='yellow')
    click.echo('In case of any issues the following command can be used to restore data:')
    click.secho(f"aim storage --repo {repo.root_path} restore '*'", fg='yellow')


@storage.command(name='restore')
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
def restore_runs(ctx, hashes, yes):
    """Rollback Runs data for given run hashes to the previous metric format."""
    if len(hashes) == 0:
        click.echo('Please specify at least one Run to delete.')
        exit(1)
    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)

    matched_hashes = match_runs(repo, hashes, lookup_dir='bcp')
    if yes:
        confirmed = True
    else:
        confirmed = click.confirm(
            f'This command will restore {len(matched_hashes)} runs from aim repo '
            f"located at '{repo_path}'. Do you want to proceed?"
        )
    if not confirmed:
        return

    remaining_runs = []
    index_manager = RepoIndexManager.get_index_manager(repo)
    for run_hash in tqdm(matched_hashes):
        try:
            restore_run_backup(repo, run_hash)
            index_manager.index(run_hash)
        except Exception as e:
            click.echo(f"Error while trying to restore run '{run_hash}'. {str(e)}.", err=True)
            remaining_runs.append(run_hash)

    if not remaining_runs:
        click.echo(f'Successfully restored {len(matched_hashes)} runs.')
    else:
        click.echo('Something went wrong while restoring runs. Remaining runs are:', err=True)
        click.secho('\t'.join(remaining_runs), fg='yellow')


@storage.command(name='prune')
@click.pass_context
def prune(ctx):
    """Remove dangling/orphan params/sequences with no referring runs."""

    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)
    repo.prune()


@storage.command('reindex')
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
@click.pass_context
def reindex(ctx, yes):
    """Recreate index database from scratch."""
    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)
    click.secho(
        f"This command will forcefully recreate index db for Aim Repo '{repo_path}'.\n"
        f'Please stop the Aim UI to not interfere with the procedure.'
    )

    if yes:
        confirmed = True
    else:
        confirmed = click.confirm('Do you want to proceed?')
    if not confirmed:
        return

    repo._recreate_index()

    return
