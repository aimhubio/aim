import click
import os

from aim._sdk.repo import Repo

from aim._ext.tracking import analytics


@click.command()
@click.option('--repo', required=False, default=os.getcwd(), type=click.Path(exists=True,
                                                                             file_okay=False,
                                                                             dir_okay=True,
                                                                             writable=True))
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
def init(repo, yes):
    """
    Initializes new repository in the --repo directory.
    Initializes new repository in the current working directory if --repo argument is not provided:
     - Creates .aim directory & runs upgrades for structured DB
    """
    re_init = False
    if Repo.exists(repo):
        re_init = yes or click.confirm('Aim repository is already initialized. '
                                       'Do you want to re-initialize to empty Aim repository?', )
        if not re_init:
            return
        Repo.rm(repo)

    Repo.init(repo)
    if re_init:
        analytics.track_event(event_name='[Repo] Initialize')
        click.echo(
            'Re-initialized empty Aim repository at \'{}\'.'.format(repo))
    else:
        analytics.track_event(event_name='[Repo] Re-initialize')
        click.echo('Initialized a new Aim repository at \'{}\'.'.format(repo))
