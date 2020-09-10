import signal
import sys
import click
from time import sleep

from aim.engine.configs import (
    AIM_CONTAINER_DEFAULT_PORT,
    AIM_CONTAINER_CMD_PORT,
    AIM_TF_LOGS_PATH,
)
from aim.engine.repo import AimRepo
from aim.engine.container import AimContainer, AimContainerCommandManager
from aim.cli.de.utils import (
    repo_init_alert,
    docker_requirement_alert,
    docker_image_pull_fail_alert,
)


@click.group()
@click.pass_context
def de_entry_point(ctx):
    repo = ctx.obj or AimRepo.get_working_repo()
    if repo is None:
        repo_init_alert()
        exit()

    ctx.obj = repo

    if not AimContainer.is_docker_installed():
        docker_requirement_alert()
        exit()


@de_entry_point.command()
@click.option('--dev', default=0, type=int)
@click.option('-p', '--port', default=AIM_CONTAINER_DEFAULT_PORT, type=int)
@click.option('-v', '--version', default='latest', type=str)
@click.option('--tf_logs', type=click.Path(exists=True, readable=True))
@click.pass_obj
def up(repo, dev, port, version, tf_logs):
    if repo is None:
        repo_init_alert()
        return

    if not AimContainer.is_docker_installed():
        docker_requirement_alert()
        return

    # Dev param
    # 0 => pull and run official image of container
    # 1 => run production build from local environment
    # 2 => run in development mode
    cont = AimContainer(repo, dev=bool(dev))

    if tf_logs:
        cont.mount_volume(tf_logs, AIM_TF_LOGS_PATH)

    click.echo(
        click.style('Running AimDE on repo `{}`'.format(repo), fg='yellow'))

    # Check if image exist
    if dev == 0 and not cont.image_exist(version):
        click.echo('Pulling AimDE image, please wait...')
        if not cont.pull(version):
            docker_image_pull_fail_alert()
            return
        else:
            click.echo('Successfully pulled AimDE image')

    if cont.get_container(running_only=True):
        kill = click.confirm('AimDE is already running. ' +
                             'Do you want to restart it?')
        if not kill:
            return

    # Kill all identical running containers
    cont.kill()

    # Run container
    if dev < 2:
        cont.add_port(port + 1, AIM_CONTAINER_CMD_PORT)
        if not cont.up(port, version):
            click.echo('Failed to run AimDE.')
            click.echo(('    Please check if port {c} is ' +
                        'accessible.').format(c=port))
            return
        else:
            sleep(4)

    cont_cmd = AimContainerCommandManager((port + 1) if dev < 2
                                          else AIM_CONTAINER_CMD_PORT)
    cont_cmd.listen()

    # Kill container after keyboard interruption
    def graceful_shutdown():
        cont_cmd.kill()

        click.echo('')
        click.echo('Shutting down...')
        try:
            cont.kill()
        except Exception:
            pass
        click.echo('Done')
        sys.exit(0)

    # Add keyboard signal interruption listener
    # signal.signal(signal.SIGINT, graceful_shutdown)
    # signal.pause()

    click.echo('Open http://127.0.0.1:{}'.format(port))
    click.echo('Press Ctrl+C to exit')

    # Graceful shutdown
    try:
        while True:
            sleep(1)
    except KeyboardInterrupt:
        graceful_shutdown()
        sys.exit(0)


@de_entry_point.command()
@click.pass_obj
def down(repo):
    cont = AimContainer(repo)

    # Kill all identical running containers
    cont.kill()


@de_entry_point.command()
@click.pass_obj
def upgrade(repo):
    cont = AimContainer(repo)

    click.echo('Pulling latest AimDE release')

    update = cont.pull()
    if update:
        click.echo('Done')
    else:
        docker_image_pull_fail_alert()


@de_entry_point.command()
@click.option('-v', '--version', required=True, type=str)
@click.pass_obj
def pull(repo, version):
    cont = AimContainer(repo)

    click.echo('Pulling AimDE v{}'.format(version))

    update = cont.pull(version)
    if update:
        click.echo('Done')
    else:
        docker_image_pull_fail_alert()
