import click
import collections
import os
from tqdm import tqdm

from aim.cli.runs.utils import list_repo_runs, match_runs
from aim.cli.upgrade.utils import convert_2to3

from aim.sdk.maintenance_run import MaintenanceRun
from aim.sdk.utils import backup_run, restore_run_backup, clean_repo_path
from aim.sdk.repo import Repo


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
def storage(ctx, repo):
    """Manage aim repository data & format updates."""
    ctx.ensure_object(dict)
    ctx.obj['repo'] = repo


@storage.group()
@click.pass_context
def upgrade(ctx):
    """Update Runs data for given run hashes to use new format."""
    pass


@upgrade.command(name='2to3')
@click.option('--drop-existing', required=False, is_flag=True, default=False)
@click.option('--skip-failed-runs', required=False, is_flag=True, default=False)
@click.option('--skip-checks', required=False, is_flag=True, default=False)
@click.pass_context
def v2to3(ctx, drop_existing, skip_failed_runs, skip_checks):
    repo_path = ctx.obj['repo']
    convert_2to3(repo_path, drop_existing, skip_failed_runs, skip_checks)


@upgrade.command(name='3.11+')
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
def to_3_11(ctx, hashes):
    """Optimize Runs Metrics data for read access."""
    if len(hashes) == 0:
        click.echo('Please specify at least one Run to update.')
        exit(1)
    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)

    matched_hashes = match_runs(repo_path, hashes)
    remaining_runs = []
    confirmed = click.confirm(f'This command will optimize the metrics data for {len(matched_hashes)} runs from aim '
                              f'repo located at \'{repo_path}\'. This process might take a while. '
                              f'Do you want to proceed?')
    if not confirmed:
        return

    for run_hash in tqdm(matched_hashes):
        try:
            run = MaintenanceRun(run_hash, repo=repo)
            if run.check_metrics_version():
                backup_run(run)
                run.update_metrics()
            else:
                click.echo(f'Run {run.hash} is already up to date. Skipping')
        except Exception:
            remaining_runs.append(run_hash)

    if not remaining_runs:
        click.echo('Finished optimizing metric data.')
    else:
        click.echo('Finished optimizing metric data. The following runs were skipped:')
        click.secho(' '.join(remaining_runs), fg='yellow')
    click.echo('In case of any issues the following command can be used to restore data:')
    click.secho(f'aim storage --repo {repo.root_path} restore \'*\'', fg='yellow')


@storage.command(name='restore')
@click.argument('hashes', nargs=-1, type=str)
@click.pass_context
def restore_runs(ctx, hashes):
    """Rollback Runs data for given run hashes to the previous ."""
    if len(hashes) == 0:
        click.echo('Please specify at least one Run to delete.')
        exit(1)
    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)

    matched_hashes = match_runs(repo_path, hashes, lookup_dir='bcp')
    confirmed = click.confirm(f'This command will restore {len(matched_hashes)} runs from aim repo '
                              f'located at \'{repo_path}\'. Do you want to proceed?')
    if not confirmed:
        return

    remaining_runs = []
    for run_hash in tqdm(matched_hashes):
        try:
            restore_run_backup(repo, run_hash)
            MaintenanceRun(run_hash, repo=repo)  # force indexing to set index metadata
        except Exception as e:
            click.echo(f'Error while trying to restore run \'{run_hash}\'. {str(e)}.', err=True)
            remaining_runs.append(run_hash)

    if not remaining_runs:
        click.echo(f'Successfully restored {len(matched_hashes)} runs.')
    else:
        click.echo('Something went wrong while restoring runs. Remaining runs are:', err=True)
        click.secho('\t'.join(remaining_runs), fg='yellow')


@storage.command(name='prune')
@click.pass_context
def prune(ctx):
    """Remove dangling/orphan params/sequences with no referring runs."""

    def flatten(d, parent_path=None):
        if parent_path and not isinstance(parent_path, tuple):
            parent_path = (parent_path, )

        all_paths = set()
        for k, v in d.items():
            if k == '__example_type__':
                continue

            new_path = parent_path + (k,) if parent_path else (k, )
            all_paths.add(new_path)
            if isinstance(v, collections.MutableMapping):
                all_paths.update(flatten(v, new_path))

        return all_paths

    repo_path = ctx.obj['repo']
    repo = Repo.from_path(repo_path)

    subtrees_to_lookup = ('attrs', 'traces_types', 'contexts', 'traces')
    repo_meta_tree = repo._get_meta_tree()

    # set of all repo paths that can be left dangling after run deletion
    repo_paths = set()
    for key in subtrees_to_lookup:
        try:
            repo_paths.update(flatten(repo_meta_tree.collect(key, strict=False), parent_path=(key,)))
        except KeyError:
            pass

    run_hashes = list_repo_runs(clean_repo_path(repo.path))
    for run_hash in tqdm(run_hashes):
        # construct unique paths set for each run
        run_paths = set()
        run_meta_tree = repo.request_tree('meta', run_hash, from_union=False, read_only=True).subtree('meta')
        for key in subtrees_to_lookup:
            try:
                run_paths.update(flatten(run_meta_tree.collect(key, strict=False), parent_path=(key,)))
            except KeyError:
                pass

        # update repo_paths keeping the elements that were not found in run_paths
        repo_paths.difference_update(run_paths)

        # if no paths are left in repo_paths set, means that we have no orphan paths
        if not repo_paths:
            break

    # everything left in the `repo_paths` set is subject to be deleted
    if not repo_paths:
        click.echo('No orphan params were found')
        return

    # acquire index container to delete orphan paths
    index_tree = repo._get_index_tree('meta', timeout=5).subtree('meta')

    # start deleting with the deepest paths first to bypass the cases when parent path is deleted before the child
    for path in sorted(repo_paths, key=len, reverse=True):
        del index_tree[path]
