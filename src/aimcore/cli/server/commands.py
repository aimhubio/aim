import os
import click

from aimcore.cli.utils import set_log_level, start_uvicorn_app, get_free_port_num
from aim._sdk.repo import Repo
from aimcore.transport.config import (
    AIM_SERVER_DEFAULT_HOST,
    AIM_SERVER_DEFAULT_PORT,
    AIM_SERVER_MOUNTED_REPO_PATH,
    AIM_SERVER_BASE_PATH
)

from aim._ext.tracking import analytics


@click.command('server')
@click.option('-h', '--host', default=AIM_SERVER_DEFAULT_HOST, type=str)
@click.option('-p', '--port', default=AIM_SERVER_DEFAULT_PORT, type=int)
@click.option('--repo', required=False, default=os.getcwd(), type=click.Path(exists=True,
                                                                             file_okay=False,
                                                                             dir_okay=True,
                                                                             writable=True))
@click.option('--ssl-keyfile', required=False, type=click.Path(exists=True,
                                                               file_okay=True,
                                                               dir_okay=False,
                                                               readable=True))
@click.option('--ssl-certfile', required=False, type=click.Path(exists=True,
                                                                file_okay=True,
                                                                dir_okay=False,
                                                                readable=True))
@click.option('--base-path', required=False, default='', type=str)
@click.option('--log-level', required=False, default='', type=str)
@click.option('--dev', is_flag=True, default=False)
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
def server(host, port,
           repo, ssl_keyfile, ssl_certfile,
           base_path, log_level, dev, yes):
    """
    Starts the Aim remote tracking server for real-time logging.

    The Aim tracking server facilitates real-time logging of experiments
    from remote locations. This command launches the server with specified
    configurations, including host, port, and associated repository.

    Like the UI, the server can also run in production or development mode.
    """
    # TODO [MV, AT] remove code duplication with aim up cmd implementation
    if not log_level:
        log_level = 'debug' if dev else 'warning'
    set_log_level(log_level)

    if base_path:
        if base_path.endswith('/'):
            base_path = base_path[:-1]
        if not base_path.startswith('/'):
            base_path = f'/{base_path}'
        os.environ[AIM_SERVER_BASE_PATH] = base_path

    if port == 0:
        try:
            port = get_free_port_num()
        except Exception:
            pass

    if not Repo.exists(repo):
        init_repo = yes or click.confirm(f'\'{repo}\' is not a valid Aim repository. Do you want to initialize it?')
        if not init_repo:
            click.echo('To initialize repo please run the following command:')
            click.secho('aim init', fg='yellow')
            return
        Repo.init(repo)
    from aimrocks.errors import RocksIOError
    try:
        # Check if repo can be opened in write mode
        repo_inst = Repo.from_path(repo, read_only=False)
    except RocksIOError:
        click.secho(
            f'Cannot open repo `{repo}` in write mode. Repo is already locked.', fg='red'
        )
        return
    os.environ[AIM_SERVER_MOUNTED_REPO_PATH] = repo

    click.secho('Running Aim Server on repo `{}`'.format(repo_inst), fg='yellow')
    click.echo('Server is mounted on {}:{}'.format(host, port), err=True)
    click.echo('Press Ctrl+C to exit')
    analytics.track_event(event_name='[Aim Remote Tracking] Start server')

    dev_package_dir = repo_inst.dev_package_dir
    # delete the repo as it needs to be opened in a child process in dev mode
    del repo_inst

    if dev:
        import aim
        import aimcore

        reload_dirs = [os.path.dirname(aim.__file__), os.path.dirname(aimcore.__file__), dev_package_dir]
    else:
        reload_dirs = []

    try:
        start_uvicorn_app('aimcore.transport.server:app',
                          host=host, port=port,
                          ssl_keyfile=ssl_keyfile, ssl_certfile=ssl_certfile, log_level=log_level,
                          reload=dev, reload_dirs=reload_dirs)
    except Exception:
        click.echo('Failed to run Aim Tracking Server. '
                   'Please see the logs above for details.')
        exit(1)
