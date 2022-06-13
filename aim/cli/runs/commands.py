import click
import os
from tqdm import tqdm

from aim.cli.runs.utils import list_repo_runs, match_runs, make_zip_archive, upload_repo_runs
from aim.sdk.repo import Repo
from aim.sdk.maintenance_run import MaintenanceRun
from aim.sdk.utils import backup_run, restore_run_backup


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
def runs(ctx, repo):
    """Manage runs in aim repository."""
    ctx.ensure_object(dict)
    ctx.obj['repo'] = repo


@runs.command(name='ls')
@click.pass_context
def list_runs(ctx):
    repo_path = ctx.obj['repo']
    if not Repo.exists(repo_path):
        click.echo(f'\'{repo_path}\' is not a valid aim repo.')
        exit(1)

    run_hashes = list_repo_runs(repo_path)

    click.echo('\t'.join(run_hashes))
    click.echo(f'Total {len(run_hashes)} runs.')


@runs.command(name='rm')
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
def remove_runs(ctx, hashes):
    if len(hashes) == 0:
        click.echo('Please specify at least one Run to delete.')
        exit(1)
    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)

    matched_hashes = match_runs(repo_path, hashes)
    confirmed = click.confirm(f'This command will permanently delete {len(matched_hashes)} runs from aim repo '
                              f'located at \'{repo_path}\'. Do you want to proceed?')
    if not confirmed:
        return

    success, remaining_runs = repo.delete_runs(matched_hashes)
    if success:
        click.echo(f'Successfully deleted {len(matched_hashes)} runs.')
    else:
        click.echo('Something went wrong while deleting runs. Remaining runs are:', err=True)
        click.secho('\t'.join(remaining_runs), fg='yellow')


@runs.command(name='cp')
@click.option('--destination', required=True,
              type=click.Path(
                  exists=True,
                  file_okay=False,
                  dir_okay=True,
                  writable=True
              ))
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
def copy_runs(ctx, destination, hashes):
    if len(hashes) == 0:
        click.echo('Please specify at least one Run to copy.')
        exit(1)
    source = ctx.obj['repo']
    source_repo = Repo.from_path(source)
    destination_repo = Repo.from_path(destination)

    matched_hashes = match_runs(source, hashes)
    success, remaining_runs = source_repo.copy_runs(matched_hashes, destination_repo)
    if success:
        click.echo(f'Successfully copied {len(matched_hashes)} runs.')
    else:
        click.echo('Something went wrong while copying runs. Remaining runs are:', err=True)
        click.secho('\t'.join(remaining_runs), fg='yellow')


@runs.command(name='mv')
@click.option('--destination', required=True,
              type=click.Path(
                  exists=True,
                  file_okay=False,
                  dir_okay=True,
                  writable=True
              ))
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
def move_runs(ctx, destination, hashes):
    if len(hashes) == 0:
        click.echo('Please specify at least one Run to move.')
        exit(1)
    source = ctx.obj['repo']
    source_repo = Repo.from_path(source)
    destination_repo = Repo.from_path(destination)

    matched_hashes = match_runs(source, hashes)

    success, remaining_runs = source_repo.move_runs(matched_hashes, destination_repo)
    if success:
        click.echo(f'Successfully moved {len(matched_hashes)} runs.')
    else:
        click.echo('Something went wrong while moving runs. Remaining runs are:', err=True)
        click.secho('\t'.join(remaining_runs), fg='yellow')


@runs.command(name='upload')
@click.argument('bucket', nargs=1, type=str)
@click.pass_context
def upload_runs(ctx, bucket):
    repo_path = ctx.obj['repo']
    if not Repo.exists(repo_path):
        click.echo(f'\'{repo_path}\' is not a valid aim repo.')
        exit(1)

    zip_buffer = make_zip_archive(repo_path)
    zip_buffer.seek(0)

    success, uploaded_zip_file_name = upload_repo_runs(zip_buffer, bucket)
    if success:
        click.echo(f'Successfully uploaded runs in {uploaded_zip_file_name}.')
    else:
        click.echo(f'The storage backup failed because of the following error: {uploaded_zip_file_name}.')


@runs.command(name='update')
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
def update_runs(ctx, hashes):
    if len(hashes) == 0:
        click.echo('Please specify at least one Run to update.')
        exit(1)
    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)

    matched_hashes = match_runs(repo_path, hashes)
    confirmed = click.confirm(f'This command will optimize the metrics data for {len(matched_hashes)} runs from aim '
                              f'repo located at \'{repo_path}\'. This process might take a while. '
                              f'Do you want to proceed?')
    if not confirmed:
        return

    for run_hash in tqdm(matched_hashes):
        run = MaintenanceRun(run_hash, repo=repo)
        if run.check_metrics_version():
            backup_run(run)
            run.update_metrics()
        else:
            click.echo(f'Run {run.hash} is already up to date. Skipping')
    click.echo('Finished optimizing metric data. '
               'In case of any issues the following command can be used to restore data:')
    click.secho(f'aim runs --repo {repo.root_path} restore \'*\'', fg='yellow')


@runs.command(name='restore')
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
def restore_runs(ctx, hashes):
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
