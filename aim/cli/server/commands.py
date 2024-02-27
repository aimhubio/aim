import os
import click

from aim.sdk.repo import Repo, RepoStatus
from aim.sdk.utils import clean_repo_path
from aim.cli.utils import set_log_level, build_uvicorn_command, get_free_port_num, exec_cmd
from aim.ext.transport.config import (
    AIM_SERVER_DEFAULT_PORT,
    AIM_SERVER_DEFAULT_HOST,
    AIM_SERVER_MOUNTED_REPO_PATH,
    AIM_SERVER_BASE_PATH
)
from aim.web.configs import AIM_ENV_MODE_KEY


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
    repo_status = Repo.check_repo_status(repo_path)
    if repo_status == RepoStatus.MISSING:
        if yes:
            init_repo = True
        else:
            init_repo = click.confirm(f'\'{repo_path}\' is not a valid Aim repository. Do you want to initialize it?')
        if not init_repo:
            click.echo('To initialize repo please run the following command:')
            click.secho('aim init', fg='yellow')
            return
        repo_inst = Repo.from_path(repo_path, init=True)
    elif repo_status == RepoStatus.UPDATE_REQUIRED:
        if yes:
            upgrade_repo = True
        else:
            upgrade_repo = click.confirm(f'\'{repo_path}\' requires upgrade. Do you want to run upgrade automatically?')
        if upgrade_repo:
            from aim.cli.upgrade.utils import convert_2to3
            repo_inst = convert_2to3(repo_path, drop_existing=False, skip_failed_runs=False, skip_checks=False)
        else:
            click.echo('To upgrade repo please run the following command:')
            click.secho(f'aim upgrade --repo {repo_path} 2to3', fg='yellow')
            return
    else:
        repo_inst = Repo.from_path(repo_path)

    os.environ[AIM_SERVER_MOUNTED_REPO_PATH] = repo_inst.path

    click.secho('Running Aim Server on repo `{}`'.format(repo), fg='yellow')
    click.echo('Server is mounted on aim://{}:{}'.format(host, port), err=True)
    click.echo('Press Ctrl+C to exit')

    try:
        cmd = build_uvicorn_command('aim.ext.transport.run:app',
                                    host=host, port=port,
                                    ssl_keyfile=ssl_keyfile, ssl_certfile=ssl_certfile, log_level=log_level)
        exec_cmd(cmd, stream_output=True)
    except Exception:
        click.echo('Failed to run Aim Tracking Server. '
                   'Please see the logs above for details.')
        exit(1)
