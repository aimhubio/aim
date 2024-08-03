import os

import click

from aim.cli.utils import (
    ShellCommandException,
    build_db_upgrade_command,
    build_uvicorn_command,
    exec_cmd,
    get_free_port_num,
    get_repo_instance,
    set_log_level,
)
from aim.sdk.repo import Repo
from aim.sdk.utils import clean_repo_path
from aim.web.configs import (
    AIM_ENV_MODE_KEY,
    AIM_PROFILER_KEY,
    AIM_PROXY_URL,
    AIM_READ_ONLY_UI,
    AIM_TF_LOGS_PATH_KEY,
    AIM_UI_BASE_PATH,
    AIM_UI_DEFAULT_HOST,
    AIM_UI_DEFAULT_PORT,
    AIM_UI_MOUNTED_REPO_PATH,
)


@click.command()
@click.option('-h', '--host', default=AIM_UI_DEFAULT_HOST, type=str)
@click.option('-p', '--port', default=AIM_UI_DEFAULT_PORT, type=int)
@click.option('-w', '--workers', default=1, type=int)
@click.option('--uds', required=False, type=click.Path(exists=False, file_okay=True, dir_okay=False, readable=True))
@click.option('--repo', required=False, type=click.Path(exists=True, file_okay=False, dir_okay=True, writable=True))
@click.option('--tf_logs', type=click.Path(exists=True, readable=True))
@click.option('--dev', is_flag=True, default=False)
@click.option(
    '--ssl-keyfile', required=False, type=click.Path(exists=True, file_okay=True, dir_okay=False, readable=True)
)
@click.option(
    '--ssl-certfile', required=False, type=click.Path(exists=True, file_okay=True, dir_okay=False, readable=True)
)
@click.option('--base-path', required=False, default='', type=str)
@click.option('--profiler', is_flag=True, default=False)
@click.option('--log-level', required=False, default='', type=str)
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
@click.option('--read-only', is_flag=True, default=False)
def up(
    dev,
    host,
    port,
    workers,
    uds,
    repo,
    tf_logs,
    ssl_keyfile,
    ssl_certfile,
    base_path,
    profiler,
    log_level,
    yes,
    read_only,
):
    if dev:
        os.environ[AIM_ENV_MODE_KEY] = 'dev'
        log_level = log_level or 'debug'
    else:
        os.environ[AIM_ENV_MODE_KEY] = 'prod'

    if log_level:
        set_log_level(log_level)

    if base_path:
        # process `base_path` as ui requires leading slash
        if base_path.endswith('/'):
            base_path = base_path[:-1]
        if base_path and not base_path.startswith('/'):
            base_path = f'/{base_path}'
        os.environ[AIM_UI_BASE_PATH] = base_path

    repo_path = clean_repo_path(repo) or Repo.default_repo_path()
    repo_inst = get_repo_instance(repo_path, yes)

    if not repo_inst:
        return

    os.environ[AIM_UI_MOUNTED_REPO_PATH] = repo_inst.path

    if tf_logs:
        os.environ[AIM_TF_LOGS_PATH_KEY] = tf_logs

    if read_only:
        os.environ[AIM_READ_ONLY_UI] = '1'

    try:
        db_cmd = build_db_upgrade_command()
        exec_cmd(db_cmd, stream_output=True)
    except ShellCommandException:
        click.echo('Failed to initialize Aim DB. ' 'Please see the logs above for details.')
        return

    if port == 0:
        try:
            port = get_free_port_num()
        except Exception:
            pass

    click.echo(click.style('Running Aim UI on repo `{}`'.format(repo_inst), fg='yellow'))

    if uds:
        click.echo('Aim UI running on {}'.format(uds))
    else:
        scheme = 'https' if ssl_keyfile or ssl_certfile else 'http'
        click.echo('Open {}://{}:{}{}'.format(scheme, host, port, base_path), err=True)

    proxy_url = os.environ.get(AIM_PROXY_URL)
    if proxy_url:
        click.echo(f'Proxy {proxy_url}{base_path}/')

    click.echo('Press Ctrl+C to exit')

    if profiler:
        os.environ[AIM_PROFILER_KEY] = '1'

    try:
        server_cmd = build_uvicorn_command(
            'aim.web.run:app',
            host=host,
            port=port,
            workers=workers,
            uds=uds,
            ssl_keyfile=ssl_keyfile,
            ssl_certfile=ssl_certfile,
            log_level=log_level,
        )
        exec_cmd(server_cmd, stream_output=True)
    except ShellCommandException:
        click.echo('Failed to run Aim UI. Please see the logs above for details.')
        return
