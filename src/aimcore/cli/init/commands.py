import click
import os

from aim._sdk.repo import Repo

from aim._ext.tracking import analytics


@click.command('init')
@click.option('--repo', required=False, default=os.getcwd(), type=click.Path(exists=True,
                                                                             file_okay=False,
                                                                             dir_okay=True,
                                                                             writable=True))
@click.option('-y', '--yes', is_flag=True, help='Automatically confirm prompt')
def init(repo, yes):
    """
    Initializes or re-initializes an Aim repository at a given directory.

    This command facilitates the creation of a new Aim repository at the specified
    directory. If a repository already exists in the given directory, users are prompted
    to either re-initialize or retain the existing repository. Re-initializing results
    in an empty Aim repository.

    The command is designed to ensure smooth tracking and management of machine learning
    experiments using the Aim platform.
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
