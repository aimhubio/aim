import signal
import sys
import click

from aim.engine.aim_container import AimContainer


@click.command()
@click.pass_obj
def view(repo):
    if repo is None:
        click.echo('Repository does not exist')
        return

    cont = AimContainer(repo)

    # Kill all identical running containers
    cont.kill()

    # Run container
    if not cont.up():
        click.echo('Failed to run aim viewer')
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

    click.echo('Open http://127.0.0.1:8000/default/latest')
    click.echo('Press Ctrl+C to exit')

    # Wait for signal
    signal.pause()
