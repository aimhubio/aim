import collections

import click
import os

from aim import Run
from aim.cli.runs.utils import list_repo_runs
from aim.sdk.repo import Repo
from aim.sdk.utils import clean_repo_path


@click.group()
@click.option(
    '--path',
    required=False,
    default=os.getcwd(),
    help='Path to the aim repository.',
    type=click.Path(exists=True, file_okay=False, dir_okay=True, writable=True),
)
@click.pass_context
def repo(ctx, path):
    """Manage aim repository."""

    repo_path = clean_repo_path(path) or Repo.default_repo_path()
    if not Repo.exists(repo_path):
        click.echo(f'\'{repo_path}\' is not a valid aim repo.', err=True)
        exit(1)

    repo_inst = Repo.from_path(repo_path)
    ctx.ensure_object(dict)
    ctx.obj['repo'] = repo_inst


@repo.command(name='cleanup')
@click.pass_context
def cleanup(ctx):
    """Clean dangling/orphan params with no referring runs."""

    def flatten(d, parent_key=''):
        all_items = []
        for k, v in d.items():
            if k == '__example_type__':
                continue
            new_key = parent_key + '.' + k if parent_key else k
            all_items.append(new_key)
            if isinstance(v, collections.MutableMapping):
                all_items.extend(flatten(v, new_key))
        return all_items

    repo = ctx.obj['repo']
    repo_params = set(flatten(repo.collect_params_info()))
    run_params = set()

    run_hashes = list_repo_runs(repo.path)
    for h in run_hashes:
        run = Run(repo=repo, run_hash=h)
        params = run.meta_run_attrs_tree.collect()
        run_params.update(flatten(params))

    orphan_params = repo_params.difference(run_params)
    if not orphan_params:
        click.echo('No orphan params were found')
        return

    click.echo(f'Found {len(orphan_params)} orphan params: {", ".join(orphan_params)}')

    def remove_nested_key(entry, seq):
        if len(seq) > 1:
            entry[seq[0]] = remove_nested_key(entry[seq[0]], seq[1:])
        if len(seq) == 1:
            del entry[seq[0]]
        return entry

    meta_tree = repo._get_index_tree('meta', timeout=5).subtree('meta').subtree('attrs')
    for param in sorted(orphan_params, reverse=True):
        keys = param.split('.')
        remove_nested_key(meta_tree, keys)
