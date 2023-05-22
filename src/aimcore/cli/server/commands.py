import os
import click

from aimcore.cli.utils import set_log_level
from aim.sdk.repo import Repo
from aimcore.transport.config import AIM_SERVER_DEFAULT_HOST, AIM_SERVER_DEFAULT_PORT, AIM_SERVER_MOUNTED_REPO_PATH
from aimcore.transport.server import start_server

from aim.ext.tracking import analytics


@click.command()
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
@click.option('--log-level', required=False, default='', type=str)
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
def server(host, port,
           repo, ssl_keyfile, ssl_certfile,
           log_level, yes):
    # TODO [MV, AT] remove code duplication with aim up cmd implementation
    if log_level:
        set_log_level(log_level)

    if not Repo.exists(repo):
        init_repo = yes or click.confirm(f'\'{repo}\' is not a valid Aim repository. Do you want to initialize it?')
        if not init_repo:
            click.echo('To initialize repo please run the following command:')
            click.secho('aim init', fg='yellow')
            return
        Repo.init(repo)
    repo_inst = Repo.from_path(repo, read_only=False)
    os.environ[AIM_SERVER_MOUNTED_REPO_PATH] = repo

    click.secho('Running Aim Server on repo `{}`'.format(repo_inst), fg='yellow')
    click.echo('Server is mounted on {}:{}'.format(host, port), err=True)
    click.echo('Press Ctrl+C to exit')
    analytics.track_event(event_name='[Aim Remote Tracking] Start server')

    try:
        start_server(host, port, ssl_keyfile, ssl_certfile)
    except Exception:
        click.echo('Failed to run Aim Tracking Server. '
                   'Please see the logs for details.')
        return
