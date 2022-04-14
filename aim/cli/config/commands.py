import click

from aim.sdk.repo import Repo
from aim.sdk.utils import clean_repo_path


@click.group(invoke_without_command=True)
@click.option('--repo', required=False, type=click.Path(exists=True,
                                                        file_okay=False,
                                                        dir_okay=True,
                                                        writable=True))
@click.pass_context
def config(ctx, repo):
    repo_path = clean_repo_path(repo) or Repo.default_repo_path()
    repo_inst = Repo.from_path(repo_path)

    if ctx.invoked_subcommand is None:
        with open(repo_inst.config_file_path, 'r') as config_fh:
            print(config_fh.read())
    else:
        ctx.ensure_object(dict)
        ctx.obj['repo_inst'] = repo_inst


@config.command(name='set')
@click.pass_context
@click.argument('key', nargs=1, type=str)
@click.argument('value', nargs=1, type=str)
def set_config_option(ctx, key: str, value: str):
    repo: Repo = ctx.obj['repo_inst']
    if repo.is_remote_repo:
        click.echo(f'Setting config for remote repo \'{repo.root_path}\' is not allowed.')
        exit(1)
    repo.settings.set(key, value)


@config.command(name='reset')
@click.pass_context
def reset_to_default(ctx):
    repo: Repo = ctx.obj['repo_inst']
    if repo.is_remote_repo:
        click.echo(f'Setting config for remote repo \'{repo.root_path}\' is not allowed.')
        exit(1)
    repo.settings.reset_to_default()
