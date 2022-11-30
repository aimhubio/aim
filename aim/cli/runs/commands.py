import click
import os
import tqdm

from multiprocessing.pool import ThreadPool
from psutil import cpu_count

from aim.cli.runs.utils import list_repo_runs, match_runs, make_zip_archive, upload_repo_runs, optimize_container
from aim.sdk.repo import Repo
from aim.sdk.lock_manager import LockManager
from aim.sdk.index_manager import RepoIndexManager


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
    """List Runs available in Repo."""
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
    """Remove Run data for given run hashes."""
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
    """Copy Run data for given run hashes to destination Repo."""
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
    """Move Run data for given run hashes to destination Repo."""
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
def close_runs(ctx, hashes):
    """Close failed/stalled Runs."""
    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)

    if len(hashes) == 0:
        click.echo('Please specify at least one Run to close.')
        exit(1)

    click.secho(f'This command will forcefully close {len(hashes)} Runs from Aim Repo \'{repo_path}\'. '
                f'Please make sure Runs are not active. Data corruption may occur otherwise.')
    if not click.confirm('Do you want to proceed?'):
        return

    lock_manager = LockManager(repo.path)
    index_manager = RepoIndexManager.get_index_manager(repo)

    def close_run(run_hash):
        if lock_manager.release_locks(run_hash, force=True):
            # Run rocksdb optimizations if container locks are removed
            meta_db_path = os.path.join(repo_path, 'meta', 'chunks', run_hash)
            seqs_db_path = os.path.join(repo_path, 'seqs', 'chunks', run_hash)
            optimize_container(meta_db_path, extra_options={'compaction': True})
            optimize_container(seqs_db_path, extra_options={})
        if index_manager.run_needs_indexing(run_hash):
            index_manager.index(run_hash)

    pool = ThreadPool(cpu_count(logical=False))

    for _ in tqdm.tqdm(
            pool.imap_unordered(close_run, hashes),
            desc='Closing runs',
            total=len(hashes)):
        pass
