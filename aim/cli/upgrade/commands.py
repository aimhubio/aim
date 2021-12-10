import os

import click

from aim.cli.upgrade.utils import convert_2to3


@click.group()
@click.option('--repo', required=False,
              default=os.getcwd(),
              type=click.Path(
                  exists=True,
                  file_okay=False,
                  dir_okay=True,
                  writable=True
              ))
@click.pass_context
def upgrade(ctx, repo):
    ctx.ensure_object(dict)
    ctx.obj['repo'] = repo


@upgrade.command(name='2to3')
@click.option('--drop-existing', required=False, is_flag=True, default=False)
@click.option('--skip-failed-runs', required=False, is_flag=True, default=False)
@click.option('--skip-checks', required=False, is_flag=True, default=False)
@click.pass_context
def v2to3(ctx, drop_existing, skip_failed_runs, skip_checks):
    repo_path = ctx.obj['repo']
    convert_2to3(repo_path, drop_existing, skip_failed_runs, skip_checks)
