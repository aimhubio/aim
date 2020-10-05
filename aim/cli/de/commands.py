import signal
import sys
import click
from time import sleep

from aim.engine.configs import (
    AIM_CONTAINER_DEFAULT_PORT,
    AIM_TF_LOGS_PATH,
    AIM_CONTAINER_DEFAULT_HOST,
)
from aim.engine.repo import AimRepo
from aim.engine.container import AimContainer
from aim.cli.de.utils import (
    repo_init_alert,
    docker_requirement_alert,
    docker_image_pull_fail_alert,
)

# from aim.engine.configs import AIM_CONTAINER_CMD_PORT
# from aim.engine.container import AimContainerCommandManager


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
@click.option('-h', '--host', default=AIM_CONTAINER_DEFAULT_HOST, type=str)
@click.pass_obj
def up(repo, dev, port, version, tf_logs, host):
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
        click.style('Running Aim UI on repo `{}`'.format(repo), fg='yellow'))

    # Check if image exist
    if dev == 0 and not cont.image_exist(version):
        click.echo('Pulling Aim UI docker image, please wait...')
        if not cont.pull(version):
            docker_image_pull_fail_alert()
            return
        else:
            click.echo('Successfully pulled Aim UI image')

    if cont.get_container(running_only=True):
        kill = click.confirm('Aim UI is already running. ' +
                             'Do you want to restart it?')
        if not kill:
            return

    # Kill all identical running containers
    cont.kill()

    # Run container
    if dev < 2:
        # cont.bind(port + 1, AIM_CONTAINER_CMD_PORT)
        try:
            assert cont.up(port, host, version)
        except:
            click.echo('Failed to run Aim UI.')
            click.echo(('    Please check if address {h}:{c} is ' +
                        'accessible.').format(h=host, c=port))
            return
        else:
            sleep(4)

    # cont_cmd = AimContainerCommandManager((port + 1) if dev < 2
    #                                       else AIM_CONTAINER_CMD_PORT)
    # cont_cmd.listen()

    # Kill container after keyboard interruption
    def graceful_shutdown():
        # cont_cmd.kill()

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

    click.echo('Open http://{}:{}'.format(host, port))
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

    click.echo('Pulling latest Aim UI')

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

    click.echo('Pulling Aim UI v{}'.format(version))

    update = cont.pull(version)
    if update:
        click.echo('Done')
    else:
        docker_image_pull_fail_alert()
