import click

from aimcore.cli.conatiners.utils import match_runs
from aim._sdk.repo import Repo


@click.group()
@click.option('--repo', required=False,
              default='aim://0.0.0.0:53800',
              type=str)
@click.pass_context
def containers(ctx, repo):
    """Manage runs in aim repository."""
    ctx.ensure_object(dict)
    ctx.obj['repo'] = repo


@containers.command(name='ls')
@click.pass_context
def list_runs(ctx):
    """List Runs available in Repo."""
    repo_path = ctx.obj['repo']
    if not Repo.is_remote_path(repo_path):
        if not Repo.exists(repo_path):
            click.echo(f'\'{repo_path}\' is not a valid aim repo.')
            exit(1)

    repo = Repo.from_path(repo_path)
    run_hashes = repo.container_hashes

    click.echo('\t'.join(run_hashes))
    click.echo(f'Total {len(run_hashes)} runs.')


@containers.command(name='rm')
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


@containers.command(name='cp')
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


@containers.command(name='mv')
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


@containers.command(name='close')
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
                f'Please make sure Runs are not active.')
    if yes:
        confirmed = True
    else:
        confirmed = click.confirm('Do you want to proceed?')
    if not confirmed:
        return

    for run_hash in hashes:
        repo._close_run(run_hash)
