import os
import click

from aim.web.configs import (
    AIM_ENV_MODE_KEY,
    AIM_TF_LOGS_PATH_KEY,
    AIM_UI_BASE_PATH,
    AIM_UI_DEFAULT_HOST,
    AIM_UI_DEFAULT_PORT,
    AIM_UI_MOUNTED_REPO_PATH,
    AIM_UI_TELEMETRY_KEY,
    AIM_PROXY_URL,
    AIM_PROFILER_KEY
)
from aim.sdk.repo import Repo, RepoStatus
from aim.sdk.utils import clean_repo_path
from aim.cli.up.utils import build_db_upgrade_command, build_uvicorn_command

from aim.web.utils import exec_cmd
from aim.web.utils import ShellCommandException


@click.command()
@click.option('-h', '--host', default=AIM_UI_DEFAULT_HOST, type=str)
@click.option('-p', '--port', default=AIM_UI_DEFAULT_PORT, type=int)
@click.option('-w', '--workers', default=1, type=int)
@click.option('--repo', required=False, type=click.Path(exists=True,
                                                        file_okay=False,
                                                        dir_okay=True,
                                                        writable=True))
@click.option('--tf_logs', type=click.Path(exists=True, readable=True))
@click.option('--dev', is_flag=True, default=False)
@click.option('--ssl-keyfile', required=False, type=click.Path(exists=True,
                                                               file_okay=True,
                                                               dir_okay=False,
                                                               readable=True))
@click.option('--ssl-certfile', required=False, type=click.Path(exists=True,
                                                                file_okay=True,
                                                                dir_okay=False,
                                                                readable=True))
@click.option('--base-path', required=False, default='', type=str)
@click.option('--force-init', is_flag=True, default=False)
@click.option('--profiler', is_flag=True, default=False)
def up(dev, host, port, workers, repo, tf_logs, ssl_keyfile, ssl_certfile, base_path, force_init, profiler):
    if dev:
        os.environ[AIM_ENV_MODE_KEY] = 'dev'
    else:
        os.environ[AIM_ENV_MODE_KEY] = 'prod'

    if base_path:
        # process `base_path` as ui requires leading slash
        if base_path.endswith('/'):
            base_path = base_path[:-1]
        if base_path and not base_path.startswith('/'):
            base_path = f'/{base_path}'
        os.environ[AIM_UI_BASE_PATH] = base_path

    repo_path = clean_repo_path(repo) or Repo.default_repo_path()
    repo_status = Repo.check_repo_status(repo_path)
    if repo_status == RepoStatus.MISSING:
        init_repo = None
        if not force_init:
            init_repo = click.confirm(f'\'{repo_path}\' is not a valid Aim repository. Do you want to initialize it?')
        else:
            init_repo = True
        if not init_repo:
            click.echo('To initialize repo please run the following command:')
            click.secho('aim init', fg='yellow')
            return
        repo_inst = Repo.from_path(repo_path, init=True)
    elif repo_status == RepoStatus.UPDATE_REQUIRED:
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
        if repo_status == RepoStatus.PATCH_REQUIRED:
            repo_inst.structured_db.run_upgrades()

    os.environ[AIM_UI_MOUNTED_REPO_PATH] = repo_inst.path

    if tf_logs:
        os.environ[AIM_TF_LOGS_PATH_KEY] = tf_logs

    try:
        db_cmd = build_db_upgrade_command()
        exec_cmd(db_cmd, stream_output=True)
    except ShellCommandException:
        click.echo('Failed to initialize Aim DB. '
                   'Please see the logs above for details.')
        return

    if dev or (os.getenv(AIM_UI_TELEMETRY_KEY) is not None and os.getenv(AIM_UI_TELEMETRY_KEY) == '0'):
        os.environ[AIM_UI_TELEMETRY_KEY] = '0'
    else:
        os.environ[AIM_UI_TELEMETRY_KEY] = '1'
        alert_msg = 'Aim UI collects anonymous usage analytics.'
        opt_out_msg = 'Read how to opt-out here: '
        opt_out_url = 'https://aimstack.readthedocs.io/en/latest/community/telemetry.html'
        line_width = max(len(opt_out_msg), len(alert_msg), len(opt_out_url)) + 8
        click.echo('┌{}┐'.format('-' * (line_width - 2)))
        click.echo('{}{}{}'.format(' ' * ((line_width - len(alert_msg)) // 2),
                                   alert_msg,
                                   ' ' * ((line_width - len(alert_msg)) // 2)))
        click.echo('{}{}{}'.format(' ' * ((line_width - len(opt_out_msg)) // 2),
                                   opt_out_msg,
                                   ' ' * ((line_width - len(opt_out_msg)) // 2)))
        click.echo('{}{}{}'.format(' ' * ((line_width - len(opt_out_url)) // 2),
                                   opt_out_url,
                                   ' ' * ((line_width - len(opt_out_url)) // 2)))
        click.echo('└{}┘'.format('-' * (line_width - 2)))

    click.echo(click.style('Running Aim UI on repo `{}`'.format(repo_inst), fg='yellow'))

    scheme = 'https' if ssl_keyfile or ssl_certfile else 'http'

    click.echo('Open {}://{}:{}{}'.format(scheme, host, port, base_path), err=True)

    proxy_url = os.environ.get(AIM_PROXY_URL)
    if proxy_url:
        click.echo(f'Proxy {proxy_url}{base_path}/')

    click.echo('Press Ctrl+C to exit')

    if profiler:
        os.environ[AIM_PROFILER_KEY] = '1'

    try:
        server_cmd = build_uvicorn_command(host, port, workers, ssl_keyfile, ssl_certfile)
        exec_cmd(server_cmd, stream_output=True)
    except ShellCommandException:
        click.echo('Failed to run Aim UI. Please see the logs above for details.')
        return
