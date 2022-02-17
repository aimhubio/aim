import click
import os

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
    chunks_dir = os.path.join(repo_path, '.aim', 'meta', 'chunks')
    run_hashes = os.listdir(chunks_dir)

    click.echo('\t'.join(run_hashes))
    click.echo(f'Total {len(run_hashes)} runs.')


@runs.command(name='rm')
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
def remove_runs(ctx, hashes):
    if len(hashes) == 0:
        click.echo('Please specify at lest one Run to delete.')
        exit(1)
    repo_path = ctx.obj['repo']
    confirmed = click.confirm(f'This command will permanently delete {len(hashes)} runs from aim repo located at '
                              f'\'{repo_path}\'. Do you want to proceed?')
    if not confirmed:
        return
    repo = Repo.from_path(repo_path)
    success, remaining_runs = repo.delete_runs(hashes)
    if success:
        click.echo(f'Successfully deleted {len(hashes)} runs.')
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
        click.echo('Please specify at lest one Run to delete.')
        exit(1)
    source = ctx.obj['repo']
    source_repo = Repo.from_path(source)
    destination_repo = Repo.from_path(destination)

    success, remaining_runs = source_repo.copy_runs(hashes, destination_repo)
    if success:
        click.echo(f'Successfully copied {len(hashes)} runs.')
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
        click.echo('Please specify at lest one Run to delete.')
        exit(1)
    source = ctx.obj['repo']
    source_repo = Repo.from_path(source)
    destination_repo = Repo.from_path(destination)

    success, remaining_runs = source_repo.move_runs(hashes, destination_repo)
    if success:
        click.echo(f'Successfully moved {len(hashes)} runs.')
    else:
        click.echo('Something went wrong while moving runs. Remaining runs are:', err=True)
        click.secho('\t'.join(remaining_runs), fg='yellow')
