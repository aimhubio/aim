import signal
import sys
import click

from aim.engine.aim_container import AimContainer


@click.group()
@click.pass_obj
def view_entry_point(repo):
    if repo is None:
        click.echo('Repository does not exist')
        return


@view_entry_point.command()
@click.pass_obj
def up(repo):
    cont = AimContainer(repo)

    click.echo(
        click.style('Mounting board to {} '.format(repo), fg='yellow'))

    # Kill all identical running containers
    cont.kill()

    # Check if image exist
    if not cont.image_exist():
        click.echo('Pulling aim board image')
        if not cont.pull():
            click.echo('An error occurred')
            click.echo('    (use "docker login" for authentication)')
            return
        else:
            click.echo('Successfully pulled aim board image')

    # Run container
    if not cont.up():
        click.echo('Failed to run aim board')
        return

    # Implement SIGINT signal handler to kill container after
    # keyboard interruption
    def signal_handler(sig, frame):
        click.echo('')
        click.echo('Shutting down...')
        try:
            cont.kill()
        except Exception:
            pass
        click.echo('Shutdown')
        sys.exit(0)

    # Add keyboard signal interruption listener
    signal.signal(signal.SIGINT, signal_handler)

    click.echo('Open http://127.0.0.1:8000/default/index')
    click.echo('Press Ctrl+C to exit')

    # Wait for signal
    signal.pause()


@view_entry_point.command()
@click.pass_obj
def down(repo):
    cont = AimContainer(repo)

    # Kill all identical running containers
    cont.kill()


@view_entry_point.command()
@click.pass_obj
def upgrade(repo):
    cont = AimContainer(repo)

    click.echo('Pulling latest aim board release')

    update = cont.pull()
    if update:
        click.echo('Done')
    else:
        click.echo('An error occurred')
        click.echo('    (use "docker login" for authentication)')
