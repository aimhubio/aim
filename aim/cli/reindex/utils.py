import click
import filelock
import os
import tqdm
from psutil import cpu_count
from typing import TYPE_CHECKING

from multiprocessing.pool import ThreadPool
from functools import partial

from aim.sdk.run import Run
from aim.storage.rockscontainer import RocksContainer

if TYPE_CHECKING:
    from aim.sdk.repo import Repo


def finalize_stalled_runs(repo: 'Repo', runs: set):
    runs_in_progress = []
    for run_hash in tqdm.tqdm(runs, desc='Finalizing stalled runs', total=len(runs)):
        try:
            run = Run(run_hash=run_hash, repo=repo, system_tracking_interval=None)
        except filelock.Timeout:
            runs_in_progress.append(run_hash)
        else:
            # TODO: [AT] handle lock timeout on index db (retry logic).
            run.finalize()
    if runs_in_progress:
        click.echo('Skipped indexing for the following runs in progress:')
        for run_hash in runs_in_progress:
            click.secho(f'\t\'{run_hash}\'', fg='yellow')


def run_flushes_and_compactions(repo: 'Repo', runs_to_skip: set):
    meta_dbs_path = os.path.join(repo.path, 'meta', 'chunks')
    seq_dbs_path = os.path.join(repo.path, 'seqs', 'chunks')
    meta_dbs_names = set(os.listdir(meta_dbs_path)).difference(runs_to_skip)
    seq_dbs_names = set(os.listdir(seq_dbs_path)).difference(runs_to_skip)
    meta_index_container_path = os.path.join(repo.path, 'meta', 'index')

    pool = ThreadPool(cpu_count(logical=False))

    def optimize_container(path, extra_options):
        rc = RocksContainer(path, read_only=True, **extra_options)
        rc.optimize_db_for_read()

    meta_containers = [os.path.join(meta_dbs_path, db) for db in meta_dbs_names]
    for _ in tqdm.tqdm(
        pool.imap_unordered(partial(optimize_container, extra_options={'compaction': True}), meta_containers),
        desc='Optimizing metadata',
        total=len(meta_containers)
    ):
        pass

    optimize_container(meta_index_container_path, extra_options={'compaction': True})

    seq_containers = [os.path.join(seq_dbs_path, db) for db in seq_dbs_names]
    for _ in tqdm.tqdm(
        pool.imap_unordered(partial(optimize_container, extra_options={}), seq_containers),
        desc='Optimizing sequence data',
        total=len(seq_containers)
    ):
        pass
