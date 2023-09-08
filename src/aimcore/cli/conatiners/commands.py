import click

from aimcore.cli.conatiners.utils import match_runs
from aim._sdk.repo import Repo


@click.group()
@click.option('--repo', required=False,
              default='aim://0.0.0.0:53800',
              type=str)
@click.pass_context
def containers(ctx, repo):
    """Manage containers in aim repository."""
    ctx.ensure_object(dict)
    ctx.obj['repo'] = repo


@containers.command(name='ls')
@click.pass_context
def list_containers(ctx):
    """List Containers available in Repo."""
    # TODO [MV]: add more useful information
    repo_path = ctx.obj['repo']
    if not Repo.is_remote_path(repo_path):
        if not Repo.exists(repo_path):
            click.echo(f'\'{repo_path}\' is not a valid aim repo.')
            exit(1)

    repo = Repo.from_path(repo_path)
    container_hashes = repo.container_hashes

    click.echo('\t'.join(container_hashes))
    click.echo(f'Total {len(container_hashes)} containers.')


@containers.command(name='rm')
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
def remove_containers(ctx, hashes, yes):
    """Remove Container data for given container hashes."""
    if len(hashes) == 0:
        click.echo('Please specify at least one Container to delete.')
        exit(1)
    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)

    matched_hashes = match_runs(repo, hashes)
    if yes:
        confirmed = True
    else:
        confirmed = click.confirm(f'This command will permanently delete {len(matched_hashes)} containers'
                                  f' from aim repo located at \'{repo_path}\'. Do you want to proceed?')
    if not confirmed:
        return

    success, remaining_containers = repo.delete_containers(matched_hashes)
    if success:
        click.echo(f'Successfully deleted {len(matched_hashes)} containers.')
    else:
        click.echo('Something went wrong while deleting containers. Remaining containers are:', err=True)
        click.secho('\t'.join(remaining_containers), fg='yellow')


@containers.command(name='cp')
@click.option('--destination', required=True, type=str)
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
def copy_containers(ctx, destination, hashes):
    """Copy Container data for given container hashes to destination Repo."""
    if len(hashes) == 0:
        click.echo('Please specify at least one Container to copy.')
        exit(1)
    source = ctx.obj['repo']
    source_repo = Repo.from_path(source)
    destination_repo = Repo.from_path(destination)

    matched_hashes = match_runs(source_repo, hashes)
    success, remaining_containers = source_repo.copy_containers(matched_hashes, destination_repo)
    if success:
        click.echo(f'Successfully copied {len(matched_hashes)} containers.')
    else:
        click.echo('Something went wrong while copying containers. Remaining containers are:', err=True)
        click.secho('\t'.join(remaining_containers), fg='yellow')


@containers.command(name='mv')
@click.option('--destination', required=True,
              type=str)
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
def move_containers(ctx, destination, hashes):
    """Move Container data for given container hashes to destination Repo."""
    if len(hashes) == 0:
        click.echo('Please specify at least one Container to move.')
        exit(1)
    source = ctx.obj['repo']
    source_repo = Repo.from_path(source)
    destination_repo = Repo.from_path(destination)

    matched_hashes = match_runs(source_repo, hashes)

    success, remaining_containers = source_repo.move_containers(matched_hashes, destination_repo)
    if success:
        click.echo(f'Successfully moved {len(matched_hashes)} containers.')
    else:
        click.echo('Something went wrong while moving containers. Remaining containers are:', err=True)
        click.secho('\t'.join(remaining_containers), fg='yellow')


@containers.command(name='close')
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
def close_containers(ctx, hashes, yes):
    """Close failed/stalled containers."""
    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)

    if len(hashes) == 0:
        click.echo('Please specify at least one Container to close.')
        exit(1)

    click.secho(f'This command will forcefully close {len(hashes)} Containers from Aim Repo \'{repo_path}\'. '
                f'Please make sure Containers are not active.')
    if yes:
        confirmed = True
    else:
        confirmed = click.confirm('Do you want to proceed?')
    if not confirmed:
        return

    for container_hash in hashes:
        repo._close_container(container_hash)
