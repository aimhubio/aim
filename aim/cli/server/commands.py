import os

import click

from aim.cli.utils import (
    ShellCommandException,
    build_uvicorn_command,
    exec_cmd,
    get_free_port_num,
    get_repo_instance,
    set_log_level,
)
from aim.ext.transport.config import (
    AIM_SERVER_BASE_PATH,
    AIM_SERVER_DEFAULT_HOST,
    AIM_SERVER_DEFAULT_PORT,
    AIM_SERVER_MOUNTED_REPO_PATH,
)
from aim.sdk.repo import Repo
from aim.sdk.utils import clean_repo_path
from aim.web.configs import AIM_ENV_MODE_KEY


@click.command('server')
@click.option('-h', '--host', default=AIM_SERVER_DEFAULT_HOST, type=str)
@click.option('-p', '--port', default=AIM_SERVER_DEFAULT_PORT, type=int)
@click.option(
    '--repo',
    required=False,
    default=os.getcwd(),
    type=click.Path(exists=True, file_okay=False, dir_okay=True, writable=True),
)
@click.option(
    '--ssl-keyfile', required=False, type=click.Path(exists=True, file_okay=True, dir_okay=False, readable=True)
)
@click.option(
    '--ssl-certfile', required=False, type=click.Path(exists=True, file_okay=True, dir_okay=False, readable=True)
)
@click.option('--base-path', required=False, default='', type=str)
@click.option('--log-level', required=False, default='', type=str)
@click.option('--dev', is_flag=True, default=False)
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
def server(host, port, repo, ssl_keyfile, ssl_certfile, base_path, log_level, dev, yes):
    """
    Starts the Aim remote tracking server for real-time logging.

    The Aim tracking server facilitates real-time logging of experiments
    from remote locations. This command launches the server with specified
    configurations, including host, port, and associated repository.

    Like the UI, the server can also run in production or development mode.
    """
    if dev:
        os.environ[AIM_ENV_MODE_KEY] = 'dev'
        log_level = log_level or 'debug'
    else:
        os.environ[AIM_ENV_MODE_KEY] = 'prod'

    if log_level:
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

    repo_path = clean_repo_path(repo) or Repo.default_repo_path()
    repo_inst = get_repo_instance(repo_path, yes)

    if not repo_inst:
        return

    os.environ[AIM_SERVER_MOUNTED_REPO_PATH] = repo_inst.path

    click.secho('Running Aim Server on repo `{}`'.format(repo), fg='yellow')
    click.echo('Server is mounted on aim://{}:{}'.format(host, port), err=True)
    click.echo('Press Ctrl+C to exit')

    try:
        cmd = build_uvicorn_command(
            'aim.ext.transport.run:app',
            host=host,
            port=port,
            ssl_keyfile=ssl_keyfile,
            ssl_certfile=ssl_certfile,
            log_level=log_level,
        )
        exec_cmd(cmd, stream_output=True)
    except ShellCommandException:
        click.echo('Failed to run Aim Tracking Server. ' 'Please see the logs above for details.')
        exit(1)
