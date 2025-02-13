import os

import click

from aim.cli.convert.processors import (
    parse_mlflow_logs,
    parse_tb_logs,
    parse_wandb_logs,
)
from aim.sdk.repo import Repo
from aim.sdk.utils import clean_repo_path
from click import ClickException


@click.group()
@click.option('--repo', required=False, type=click.Path(exists=True, file_okay=False, dir_okay=True, writable=True))
@click.pass_context
def convert(ctx, repo):
    ctx.ensure_object(dict)

    repo_path = clean_repo_path(repo) or Repo.default_repo_path()
    repo_inst = Repo.from_path(repo_path)

    ctx.obj['repo_inst'] = repo_inst


@convert.command(name='tensorboard')
@click.pass_context
@click.option('--logdir', required=True, type=click.Path(exists=True, readable=True, dir_okay=True, resolve_path=True))
@click.option('--flat', '-f', required=False, is_flag=True, default=False)
@click.option('--no-cache', required=False, is_flag=True, default=False)
def convert_tensorboard(ctx, logdir, flat, no_cache):
    repo_inst = ctx.obj['repo_inst']
    parse_tb_logs(logdir, repo_inst, flat, no_cache)


@convert.command(name='tf')
@click.pass_context
@click.option('--logdir', required=True, type=click.Path(exists=True, readable=True, dir_okay=True, resolve_path=True))
@click.option('--flat', '-f', required=False, is_flag=True, default=False)
def convert_tensorflow(ctx, logdir, flat):
    click.secho(
        "WARN: Command 'tf' is deprecated and will be removed in future releases, please use 'tensorboard' instead.",
        fg='red',
    )
    repo_inst = ctx.obj['repo_inst']
    parse_tb_logs(logdir, repo_inst, flat)


@convert.command(name='mlflow')
@click.pass_context
@click.option('--tracking_uri', required=False, default=None)
@click.option('--experiment', '-e', required=False, default=None)
def convert_mlflow(ctx, tracking_uri=None, **kwargs):
    repo_inst = ctx.obj['repo_inst']
    tracking_uri = tracking_uri or os.environ.get('MLFLOW_TRACKING_URI')
    if not tracking_uri:
        raise ClickException('MLFlow tracking URI must be provided either trough ENV or CLI.')
    parse_mlflow_logs(repo_inst, tracking_uri, **kwargs)


@convert.command(name='wandb')
@click.pass_context
@click.option('--entity', required=True, default=None)
@click.option('--project', required=True, default=None)
@click.option('--run-id', required=False, default=None)
def convert_wandb(ctx, entity=None, project=None, **kwargs):
    repo_inst = ctx.obj['repo_inst']
    parse_wandb_logs(repo_inst, entity, project, **kwargs)
