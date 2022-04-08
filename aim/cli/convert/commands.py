import os

import click
from click import ClickException

from aim.sdk.repo import Repo
from aim.sdk.utils import clean_repo_path
from aim.cli.convert.processors import (
    parse_tb_logs,
    parse_mlflow_logs
)


@click.group()
@click.option('--repo', required=False, type=click.Path(exists=True,
                                                        file_okay=False,
                                                        dir_okay=True,
                                                        writable=True))
@click.pass_context
def convert(ctx, repo):
    ctx.ensure_object(dict)

    repo_path = clean_repo_path(repo) or Repo.default_repo_path()
    repo_inst = Repo.from_path(repo_path)

    ctx.obj['repo_inst'] = repo_inst


@convert.command(name='tensorboard')
@click.pass_context
@click.option('--logdir', required=True, type=click.Path(exists=True,
                                                         readable=True,
                                                         dir_okay=True,
                                                         resolve_path=True))
@click.option('--flat', '-f', required=False, is_flag=True, default=False)
def convert_tensorboard(ctx, logdir, flat):
    repo_inst = ctx.obj['repo_inst']
    parse_tb_logs(logdir, repo_inst, flat)


@convert.command(name='tf')
@click.pass_context
@click.option('--logdir', required=True, type=click.Path(exists=True,
                                                         readable=True,
                                                         dir_okay=True,
                                                         resolve_path=True))
@click.option('--flat', '-f', required=False, is_flag=True, default=False)
def convert_tensorflow(ctx, logdir, flat):
    click.secho('WARN: Command \'tf\' is deprecated and will be removed in future releases,'
                ' please use \'tensorboard\' instead.', fg='red')
    repo_inst = ctx.obj['repo_inst']
    parse_tb_logs(logdir, repo_inst, flat)


@convert.command(name='mlflow')
@click.pass_context
@click.option('--tracking_uri', required=False, default=None)
@click.option('--experiment', '-e', required=False, default=None)
def convert_mlflow(ctx, tracking_uri=None, **kwargs):
    repo_inst = ctx.obj['repo_inst']
    tracking_uri = tracking_uri or os.environ.get("MLFLOW_TRACKING_URI")
    if not tracking_uri:
        raise ClickException("MLFlow tracking URI must be provided either trough ENV or CLI.")
    parse_mlflow_logs(repo_inst, tracking_uri, **kwargs)
