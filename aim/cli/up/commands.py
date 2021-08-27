import os
import click

from aim.web.configs import AIM_UI_DEFAULT_PORT, AIM_UI_DEFAULT_HOST, AIM_TF_LOGS_PATH_KEY, AIM_WEB_ENV_KEY, \
    AIM_UI_MOUNTED_REPO_PATH, AIM_UI_TELEMETRY_KEY
from aim.sdk.repo import Repo
from aim.sdk.utils import clean_repo_path
from aim.cli.up.utils import build_db_upgrade_command, build_uvicorn_command

from aim.web.utils import exec_cmd
from aim.web.utils import ShellCommandException


@click.command()
@click.option('-h', '--host', default=AIM_UI_DEFAULT_HOST, type=str)
@click.option('-p', '--port', default=AIM_UI_DEFAULT_PORT, type=int)
@click.option('--repo', required=False, type=click.Path(exists=True,
                                                        file_okay=False,
                                                        dir_okay=True,
                                                        writable=True))
@click.option('--tf_logs', type=click.Path(exists=True, readable=True))
@click.option('--dev', is_flag=True, default=False)
def up(dev, host, port, repo, tf_logs):
    repo_path = clean_repo_path(repo)
    if repo_path:
        repo_inst = Repo.from_path(repo_path)
    else:
        repo_inst = Repo.default_repo()
    repo_inst.structured_db.run_upgrades()

    os.environ[AIM_UI_MOUNTED_REPO_PATH] = repo_inst.path

    if dev:
        os.environ[AIM_WEB_ENV_KEY] = 'dev'
    else:
        os.environ[AIM_WEB_ENV_KEY] = 'prod'

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
        opt_out_url = 'https://github.com/aimhubio/aim#anonymized-telemetry'
        line_width = max(len(opt_out_msg), len(alert_msg)) + 16
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

    click.echo(
        click.style('Running Aim UI on repo `{}`'.format(repo_inst),
                    fg='yellow'))

    click.echo('Open http://{}:{}'.format(host, port))
    click.echo('Press Ctrl+C to exit')

    try:
        server_cmd = build_uvicorn_command(host, port, 1)
        exec_cmd(server_cmd, stream_output=True)
    except ShellCommandException:
        click.echo('Failed to run Aim UI. '
                   'Please see the logs above for details.')
        return
