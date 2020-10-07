import signal
import sys
import click
from time import sleep

from aim.engine.configs import (
    AIM_CONTAINER_DEFAULT_PORT,
    AIM_TF_LOGS_PATH,
    AIM_CONTAINER_DEFAULT_HOST,
)
from aim.engine.utils import clean_repo_path
from aim.engine.repo import AimRepo
from aim.engine.container import AimContainer
from aim.cli.de.utils import (
    repo_init_alert,
    docker_image_pull_fail_alert,
    check_docker_dependency,
)

# from aim.engine.configs import AIM_CONTAINER_CMD_PORT
# from aim.engine.container import AimContainerCommandManager


@click.group()
def de_entry_point():
    check_docker_dependency()


@de_entry_point.command()
@click.option('--dev', default=0, type=int)
@click.option('-h', '--host', default=AIM_CONTAINER_DEFAULT_HOST, type=str)
@click.option('-p', '--port', default=AIM_CONTAINER_DEFAULT_PORT, type=int)
@click.option('-v', '--version', default='latest', type=str)
@click.option('--repo', required=False, type=click.Path(exists=True,
                                                        file_okay=False,
                                                        dir_okay=True,
                                                        writable=True))
@click.option('--tf_logs', type=click.Path(exists=True, readable=True))
@click.option('-d', '--detach', is_flag=True, default=False)
@click.pass_obj
def up(repo_inst, dev, host, port, version, repo, tf_logs, detach):
    check_docker_dependency()

    repo_path = clean_repo_path(repo)
    if repo_path:
        repo_inst = AimRepo(repo_path)
    if repo_inst is None or not repo_inst.exists():
        repo_init_alert()
        return

    # Dev param
    # 0 => pull and run official image of container
    # 1 => run production build from local environment
    # 2 => run in development mode
    cont = AimContainer(repo_inst, dev=bool(dev))

    if tf_logs:
        cont.mount_volume(tf_logs, AIM_TF_LOGS_PATH)

    click.echo(
        click.style('Running Aim UI on repo `{}`'.format(repo_inst),
                    fg='yellow'))

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

    # if dev < 2
    # cont.bind(port + 1, AIM_CONTAINER_CMD_PORT)
    try:
        assert cont.up(port, host, version)
    except:
        click.echo('Failed to run Aim UI.')
        click.echo(('    Please check if address {h}:{c} is ' +
                    'accessible.').format(h=host, c=port))
        return

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

    try:
        sleep(4)
        click.echo('Open http://{}:{}'.format(host, port))

        if not detach:
            click.echo('Press Ctrl+C to exit')
            while True:
                if cont.get_container() is not None:
                    sleep(0.3)
                else:
                    click.echo('Exited')
                    return
    except KeyboardInterrupt:
        graceful_shutdown()
        sys.exit(0)


@de_entry_point.command()
@click.option('--repo', required=False, type=click.Path(exists=True,
                                                        file_okay=False,
                                                        dir_okay=True,
                                                        writable=True))
@click.pass_obj
def down(repo_inst, repo):
    check_docker_dependency()

    repo_path = clean_repo_path(repo)
    if repo_path:
        repo_inst = AimRepo(repo_path)
    if repo_inst is None or not repo_inst.exists():
        repo_init_alert()
        return

    # Kill all identical running containers
    cont = AimContainer(repo_inst)

    if cont.get_container() is not None:
        click.echo('Shutting down Aim UI at `{}`'.format(repo_inst.path))
        cont.kill()
        click.echo('Done')
    else:
        click.echo('No running Aim UI at `{}`'.format(repo_inst.path))


@de_entry_point.command()
def upgrade():
    check_docker_dependency()

    click.echo('Pulling latest Aim UI')

    if AimContainer.pull():
        click.echo('Done')
    else:
        docker_image_pull_fail_alert()


@de_entry_point.command()
@click.option('-v', '--version', required=True, type=str)
def pull(version):
    check_docker_dependency()

    click.echo('Pulling Aim UI v{}'.format(version))

    if AimContainer.pull(version):
        click.echo('Done')
    else:
        docker_image_pull_fail_alert()
