import click
import tabulate

from aimcore.cli.conatiners.utils import match_runs
from aim._sdk.repo import Repo


@click.group()
@click.option('--repo', required=False,
              default='aim://0.0.0.0:53800',
              type=str)
@click.pass_context
def containers(ctx, repo):
    """
    Command group for managing containers within an Aim repository.

    This command group provides functionalities to list, delete, copy, move, and
    close containers in an Aim repository. Each sub-command pertains to a specific
    operation on the containers.

    By default, the command group targets the Aim repository at 'aim://0.0.0.0:53800'.
    A different repository can be specified using the '--repo' option.
    """
    ctx.ensure_object(dict)
    ctx.obj['repo'] = repo


@containers.command(name='ls')
@click.pass_context
def list_containers(ctx):
    """
    List all available containers within an Aim repository.

    This command retrieves and displays containers from a specified Aim repository
    in a tabulated format. For each container, various properties, as determined by
    the Aim system, are shown. The default display format is 'psql',
    which structures the output in a PostgreSQL-like table style.
    """
    repo_path = ctx.obj['repo']
    if not Repo.is_remote_path(repo_path):
        if not Repo.exists(repo_path):
            click.echo(f'\'{repo_path}\' is not a valid aim repo.')
            exit(1)

    repo = Repo.from_path(repo_path)
    container_hashes = repo.container_hashes
    container_props = {}
    all_props = set()
    for hash_ in container_hashes:
        cont = repo.get_container(hash_)
        props = cont.collect_properties()
        container_props[hash_] = props
        all_props.update(props.keys())

    container_props_fmt = {'hash': []}
    container_props_fmt.update({prop: [] for prop in all_props})
    for hash_, props in container_props.items():
        container_props_fmt['hash'].append(hash_)
        for prop in all_props:
            container_props_fmt[prop].append(props.get(prop))
    click.echo(tabulate.tabulate(container_props_fmt, container_props_fmt.keys(), tablefmt='psql'))
    click.echo(f'Total {len(container_hashes)} containers.')


@containers.command(name='rm')
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
def remove_containers(ctx, hashes, yes):
    """
    Delete specified containers from an Aim repository.

    This command deletes one or more containers identified by their hashes
    from the Aim repository. You will be prompted for confirmation
    before the containers are deleted unless the `--yes` option is used.
    """
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
    """
    Copy specified containers to another Aim repository.

    This command copies one or more containers identified by their hashes
    from the current Aim repository to a destination repository.
    """
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
    """
    Move specified containers to another Aim repository.

    This command moves one or more containers identified by their hashes
    from the current Aim repository to a destination repository. After the move,
    the containers will no longer exist in the source repository.
    """
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
    """
    Forcefully close specified failed or stalled containers.

    This command attempts to close one or more containers that might have
    failed or stalled. This is a forceful operation, and you'll be warned
    to ensure the containers are not actively running.
    """
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
