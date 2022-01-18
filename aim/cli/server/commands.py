import os
import click

from aim.sdk.repo import Repo, RepoStatus
from aim.sdk.utils import clean_repo_path
from aim.ext.transport.config import AIM_SERVER_DEFAULT_HOST, AIM_SERVER_DEFAULT_PORT, AIM_SERVER_MOUNTED_REPO_PATH
from aim.ext.transport.server import run_server


@click.command()
@click.option('-h', '--host', default=AIM_SERVER_DEFAULT_HOST, type=str)
@click.option('-p', '--port', default=AIM_SERVER_DEFAULT_PORT, type=int)
@click.option('-w', '--workers', default=1, type=int)
@click.option('--repo', required=False, type=click.Path(exists=True,
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
def server(host, port, workers, repo, ssl_keyfile, ssl_certfile):
    # TODO [MV, AT] remove code duplication with aim up cmd implementation
    repo_path = clean_repo_path(repo) or Repo.default_repo_path()
    repo_status = Repo.check_repo_status(repo_path)
    if repo_status == RepoStatus.MISSING:
        init_repo = click.confirm(f'\'{repo_path}\' is not a valid Aim repository. Do you want to initialize it?')

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

    os.environ[AIM_SERVER_MOUNTED_REPO_PATH] = repo_inst.path

    click.echo(
        click.style('Running Aim Server on repo `{}`'.format(repo_inst),
                    fg='yellow'))
    click.echo('Server is mounted on {}:{}'.format(host, port), err=True)
    click.echo('Press Ctrl+C to exit')

    try:
        run_server(host, port, workers, ssl_keyfile, ssl_certfile)
    except Exception:
        click.echo('Failed to run Aim Tracking Server. '
                   'Please see the logs for details.')
        return
