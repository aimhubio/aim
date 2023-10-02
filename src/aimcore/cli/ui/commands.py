import os
import click

from aimcore.cli.utils import set_log_level, start_uvicorn_app, get_free_port_num
from aimcore.cli.ui.utils import build_db_upgrade_command
from aimcore.web.configs import (
    AIM_UI_BASE_PATH,
    AIM_UI_DEFAULT_HOST,
    AIM_UI_DEFAULT_PORT,
    AIM_UI_MOUNTED_REPO_PATH,
    AIM_UI_TELEMETRY_KEY,
    AIM_PROXY_URL,
    AIM_PROFILER_KEY
)
from aim._sdk.configs import AIM_ENV_MODE_KEY
from aim._sdk.repo import Repo

from aimcore.web.utils import exec_cmd
from aimcore.web.utils import ShellCommandException

from aim._ext.tracking import analytics


@click.command('ui')
@click.option('-h', '--host', default=AIM_UI_DEFAULT_HOST, type=str)
@click.option('-p', '--port', default=AIM_UI_DEFAULT_PORT, type=int)
@click.option('-w', '--workers', default=1, type=int)
@click.option('--uds', required=False, type=click.Path(exists=False,
                                                       file_okay=True,
                                                       dir_okay=False,
                                                       readable=True))
@click.option('--repo', required=False, default=os.getcwd(), type=click.Path(exists=True,
                                                                             file_okay=False,
                                                                             dir_okay=True,
                                                                             writable=True))
@click.option('--package', '--pkg', required=False, type=str)
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
@click.option('--profiler', is_flag=True, default=False)
@click.option('--log-level', required=False, default='', type=str)
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
def ui(host, port, repo, package,
       workers, uds,
       ssl_keyfile, ssl_certfile,
       base_path,
       profiler, log_level, dev, yes):
    """
    Launches the Aim web-based UI for interactive data exploration.

    This command starts the Aim UI, allowing users to visually explore, compare,
    and understand their machine learning experiments. The UI is customizable
    with various options to determine the host, port, associated repository,
    and more.

    The UI can operate in either production or development mode, with the latter
    offering features beneficial for Aim developers.
    """
    if not log_level:
        log_level = 'debug' if dev else 'warning'
    set_log_level(log_level)

    os.environ[AIM_ENV_MODE_KEY] = 'dev' if dev else 'prod'

    if base_path:
        # process `base_path` as ui requires leading slash
        if base_path.endswith('/'):
            base_path = base_path[:-1]
        if base_path and not base_path.startswith('/'):
            base_path = f'/{base_path}'
        os.environ[AIM_UI_BASE_PATH] = base_path

    if not Repo.exists(repo):
        init_repo = yes or click.confirm(f'\'{repo}\' is not a valid Aim repository. Do you want to initialize it?')
        if not init_repo:
            click.echo('To initialize repo please run the following command:')
            click.secho('aim init', fg='yellow')
            return
        Repo.init(repo)
    repo_inst = Repo.from_path(repo, read_only=True)
    os.environ[AIM_UI_MOUNTED_REPO_PATH] = repo

    dev_package_dir = repo_inst.dev_package_dir
    if package is not None:
        repo_inst.add_package(pkg_name=package)

    try:
        db_cmd = build_db_upgrade_command()
        exec_cmd(db_cmd, stream_output=True)
    except ShellCommandException:
        click.echo('Failed to initialize Aim DB. '
                   'Please see the logs above for details.')
        exit(1)

    if port == 0:
        try:
            port = get_free_port_num()
        except Exception:
            pass

    if not dev and os.getenv(AIM_UI_TELEMETRY_KEY, 1) == '0':
        click.echo(f'"{AIM_UI_TELEMETRY_KEY}" is ignored. Read how to opt-out here: '
                   f'https://aimstack.readthedocs.io/en/latest/community/telemetry.html')
    if dev:
        analytics.dev_mode = True
    click.secho('Running Aim UI on repo `{}`'.format(repo_inst), fg='yellow')

    if uds:
        click.echo('Aim UI running on {}'.format(uds))
    else:
        scheme = 'https' if ssl_keyfile or ssl_certfile else 'http'
        click.echo('Open {}://{}:{}{}'.format(scheme, host, port, base_path), err=True)

    proxy_url = os.environ.get(AIM_PROXY_URL)
    if proxy_url:
        click.echo(f'Proxy {proxy_url}{base_path}/')

    click.echo('Press Ctrl+C to exit')
    analytics.track_event(event_name='[Aim UI] Start UI')

    if profiler:
        os.environ[AIM_PROFILER_KEY] = '1'

    if dev:
        import aim
        import aimstack
        import aimcore

        reload_dirs = [os.path.dirname(aim.__file__), os.path.dirname(aimcore.__file__),
                       os.path.dirname(aimstack.__file__), dev_package_dir]
    else:
        reload_dirs = []

    try:
        start_uvicorn_app('aimcore.web.run:app',
                          host=host, port=port, workers=workers, uds=uds,
                          ssl_keyfile=ssl_keyfile, ssl_certfile=ssl_certfile, log_level=log_level,
                          reload=dev, reload_dirs=reload_dirs)
    except Exception:
        click.echo('Failed to run Aim UI. '
                   'Please see the logs above for details.')
        exit(1)


@click.command('up', context_settings={'ignore_unknown_options': True, 'allow_extra_args': True}, hidden=True)
def up(**kwargs):
    click.secho('Command `aim up` has been removed. Use `aim ui` instead.', fg='yellow')
