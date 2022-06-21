import click
import os
from tqdm import tqdm

from aim.cli.runs.utils import match_runs
from aim.cli.upgrade.utils import convert_2to3

from aim.sdk.maintenance_run import MaintenanceRun
from aim.sdk.utils import backup_run, restore_run_backup
from aim.sdk.repo import Repo


@click.group()
@click.option('--repo', required=False,
              default=os.getcwd(),
              type=click.Path(
                  exists=True,
                  file_okay=False,
                  dir_okay=True,
                  writable=True
              ))
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


@upgrade.command(name='2to3')
@click.option('--drop-existing', required=False, is_flag=True, default=False)
@click.option('--skip-failed-runs', required=False, is_flag=True, default=False)
@click.option('--skip-checks', required=False, is_flag=True, default=False)
@click.pass_context
def v2to3(ctx, drop_existing, skip_failed_runs, skip_checks):
    repo_path = ctx.obj['repo']
    convert_2to3(repo_path, drop_existing, skip_failed_runs, skip_checks)


@upgrade.command(name='3.11+')
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
def to_3_11(ctx, hashes):
    """Optimize Runs Metrics data for read access."""
    if len(hashes) == 0:
        click.echo('Please specify at least one Run to update.')
        exit(1)
    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)

    matched_hashes = match_runs(repo_path, hashes)
    remaining_runs = []
    confirmed = click.confirm(f'This command will optimize the metrics data for {len(matched_hashes)} runs from aim '
                              f'repo located at \'{repo_path}\'. This process might take a while. '
                              f'Do you want to proceed?')
    if not confirmed:
        return

    for run_hash in tqdm(matched_hashes):
        try:
            run = MaintenanceRun(run_hash, repo=repo)
            if run.check_metrics_version():
                backup_run(run)
                run.update_metrics()
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
    click.secho(f'aim storage --repo {repo.root_path} restore \'*\'', fg='yellow')


@storage.command(name='restore')
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
def restore_runs(ctx, hashes):
    """Rollback Runs data for given run hashes to the previous ."""
    if len(hashes) == 0:
        click.echo('Please specify at least one Run to delete.')
        exit(1)
    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)

    matched_hashes = match_runs(repo_path, hashes, lookup_dir='bcp')
    confirmed = click.confirm(f'This command will restore {len(matched_hashes)} runs from aim repo '
                              f'located at \'{repo_path}\'. Do you want to proceed?')
    if not confirmed:
        return

    remaining_runs = []
    for run_hash in tqdm(matched_hashes):
        try:
            restore_run_backup(repo, run_hash)
            MaintenanceRun(run_hash, repo=repo)  # force indexing to set index metadata
        except Exception as e:
            click.echo(f'Error while trying to restore run \'{run_hash}\'. {str(e)}.', err=True)
            remaining_runs.append(run_hash)

    if not remaining_runs:
        click.echo(f'Successfully restored {len(matched_hashes)} runs.')
    else:
        click.echo('Something went wrong while restoring runs. Remaining runs are:', err=True)
        click.secho('\t'.join(remaining_runs), fg='yellow')
