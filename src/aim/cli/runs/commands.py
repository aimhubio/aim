import click
import os
import tqdm

from multiprocessing.pool import ThreadPool
from psutil import cpu_count

from aim.cli.runs.utils import match_runs, make_zip_archive, upload_repo_runs
from aim.sdk.repo import Repo


@click.group()
@click.option('--repo', required=False,
              default=os.getcwd(),
              type=str)
@click.pass_context
def runs(ctx, repo):
    """Manage runs in aim repository."""
    ctx.ensure_object(dict)
    ctx.obj['repo'] = repo


@runs.command(name='ls')
@click.pass_context
def list_runs(ctx):
    """List Runs available in Repo."""
    repo_path = ctx.obj['repo']
    if not Repo.is_remote_path(repo_path):
        if not Repo.exists(repo_path):
            click.echo(f'\'{repo_path}\' is not a valid aim repo.')
            exit(1)

    repo = Repo.from_path(repo_path)
    run_hashes = repo.list_all_runs()

    click.echo('\t'.join(run_hashes))
    click.echo(f'Total {len(run_hashes)} runs.')


@runs.command(name='rm')
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
def remove_runs(ctx, hashes, yes):
    """Remove Run data for given run hashes."""
    if len(hashes) == 0:
        click.echo('Please specify at least one Run to delete.')
        exit(1)
    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)

    matched_hashes = match_runs(repo, hashes)
    if yes:
        confirmed = True
    else:
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
@click.option('--destination', required=True, type=str)
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
def copy_runs(ctx, destination, hashes):
    """Copy Run data for given run hashes to destination Repo."""
    if len(hashes) == 0:
        click.echo('Please specify at least one Run to copy.')
        exit(1)
    source = ctx.obj['repo']
    source_repo = Repo.from_path(source)
    destination_repo = Repo.from_path(destination)

    matched_hashes = match_runs(source_repo, hashes)
    success, remaining_runs = source_repo.copy_runs(matched_hashes, destination_repo)
    if success:
        click.echo(f'Successfully copied {len(matched_hashes)} runs.')
    else:
        click.echo('Something went wrong while copying runs. Remaining runs are:', err=True)
        click.secho('\t'.join(remaining_runs), fg='yellow')


@runs.command(name='mv')
@click.option('--destination', required=True,
              type=str)
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
def move_runs(ctx, destination, hashes):
    """Move Run data for given run hashes to destination Repo."""
    if len(hashes) == 0:
        click.echo('Please specify at least one Run to move.')
        exit(1)
    source = ctx.obj['repo']
    source_repo = Repo.from_path(source)
    destination_repo = Repo.from_path(destination)

    matched_hashes = match_runs(source_repo, hashes)

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
    """Upload Repo backup to the given S3 bucket."""
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


@runs.command(name='close')
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
def close_runs(ctx, hashes, yes):
    """Close failed/stalled Runs."""
    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)

    if len(hashes) == 0:
        click.echo('Please specify at least one Run to close.')
        exit(1)

    click.secho(f'This command will forcefully close {len(hashes)} Runs from Aim Repo \'{repo_path}\'. '
                f'Please make sure Runs are not active. Data corruption may occur otherwise.')
    if yes:
        confirmed = True
    else:
        confirmed = click.confirm('Do you want to proceed?')
    if not confirmed:
        return

    pool = ThreadPool(cpu_count(logical=False))

    for _ in tqdm.tqdm(
            pool.imap_unordered(repo._close_run, hashes),
            desc='Closing runs',
            total=len(hashes)):
        pass
