import json
import pathlib

import click
import tqdm
import logging

from typing import Dict, Optional

from aim import Repo
from aim._core.storage.rockscontainer import RocksContainer
from aim._core.storage.treeview import TreeView
from aimstack.base import Run, SystemMetric, Metric

logger = logging.getLogger(__name__)

RUN_DATA_QUERY_TEMPLATE = """
SELECT
    run.hash as hash,
    run.name as name,
    run.description as description,
    run.is_archived as archived,
    experiment.name as experiment,
    json_group_array(tag.name) as tags,
    {select_notes} as notes
FROM
    run
    LEFT OUTER JOIN experiment ON run.experiment_id = experiment.id
    {notes_join_clause}
    LEFT OUTER JOIN run_tag ON run.id = run_tag.run_id LEFT JOIN tag ON run_tag.tag_id = tag.id
GROUP BY
    run.hash;
"""


SEQUENCE_TYPE_MAP = {
    'float': Run.get_metric,
    'int': Run.get_metric,
    'number': Run.get_metric,
    'aim.image': Run.get_image_sequence,
    'list(aim.image)': Run.get_image_sequence,
    'aim.audio': Run.get_audio_sequence,
    'list(aim.audio)': Run.get_audio_sequence,
    'aim.text': Run.get_text_sequence,
    'list(aim.text)': Run.get_text_sequence,
    'aim.distribution': Run.get_distribution_sequence,
    'aim.figure': Run.get_figure_sequence,
}


def migrate_v1_sequence_data(run: Run, trace_tree: TreeView, length: int, item_type: str, name: str, context: Dict):
    if name.startswith('__system'):
        seq = run.sequences.typed_sequence(SystemMetric, name, context)
    elif item_type == 'aim.log_line':
        seq = run.logs
    else:
        get_seq_method = SEQUENCE_TYPE_MAP.get(item_type)
        if get_seq_method is None:
            logger.warning(f'Unknown type of sequence element \'{item_type}\'. Skipping.')
            return
        seq = get_seq_method(run, name, context)
    trace_iter = zip(trace_tree.subtree('val').items(),
                     trace_tree.subtree('time').items(),
                     trace_tree.subtree('epoch').items())
    trace_iter = tqdm.tqdm(trace_iter, leave=False, total=length)
    context_str = str(context)
    if len(context_str) > 20:
        context_str = context_str[:16] + '...}'
    for (step, value), (_, time), (_, epoch) in trace_iter:
        if isinstance(seq, (SystemMetric, Metric)):
            if isinstance(value, (list, tuple)) and len(value) == 1:
                value = value[0]
        trace_iter.set_description(f'Processing sequence context={context_str}, name=\'{name}\'')
        seq.track(value, step=step, epoch=epoch, time=time)


def migrate_v2_sequence_data(run: Run, trace_data_tree: TreeView, length: int, name: str, context: Dict):
    if name.startswith('__system'):
        seq = run.sequences.typed_sequence(SystemMetric, name, context)
    else:
        seq = run.get_metric(name, context)  # only Metric sequences had V2 data format
    trace_iter = zip(trace_data_tree.subtree('step').items(),
                     trace_data_tree.subtree('val').items(),
                     trace_data_tree.subtree('time').items(),
                     trace_data_tree.subtree('epoch').items())
    trace_iter = tqdm.tqdm(trace_iter, leave=False, total=length)
    context_str = str(context)
    if len(context_str) > 20:
        context_str = context_str[:16] + '...}'
    for (_, step), (_, value), (_, time), (_, epoch) in trace_iter:
        trace_iter.set_description(f'Processing sequence context={context_str}, name=\'{name}\'')
        if isinstance(value, (list, tuple)) and len(value) == 1:
            value = value[0]
        seq.track(value, step=step, epoch=epoch, time=time)


def migrate_single_run(repo: Repo, v3_repo_path: pathlib.Path, run_hash: str, run_data: Dict):
    meta_container_path = v3_repo_path / 'meta' / 'chunks' / run_hash
    meta_container = RocksContainer(str(meta_container_path), read_only=True)
    meta_tree: TreeView = meta_container.tree()
    run_info_tree = meta_tree.subtree('meta').subtree('chunks').subtree(run_hash)
    context_info = run_info_tree.collect('contexts')
    trace_info = run_info_tree.collect('traces')

    new_run = Run(repo=repo, mode='WRITE')
    new_run[...] = run_info_tree.get('attrs', {})
    new_run['hash_'] = run_hash

    if run_data is not None:
        new_run.name = run_data['name']
        new_run.archived = run_data['archived']
        new_run.description = run_data['description']
        new_run['experiment_name'] = run_data['experiment']
        if len(run_data['tags']) > 0 and run_data['tags'][0] is not None:
            new_run['tags'] = run_data['tags']
        if len(run_data['notes']) > 0 and run_data['notes'][0] is not None:
            new_run['notes'] = run_data['notes']

    trace_container_path = v3_repo_path / 'seqs' / 'chunks' / run_hash
    trace_container = RocksContainer(str(trace_container_path), read_only=True)
    trace_tree: TreeView = trace_container.tree()
    traces_data_tree = trace_tree.subtree('seqs').subtree('chunks').subtree(run_hash)
    v2_traces_data_tree = trace_tree.subtree('seqs').subtree('v2').subtree('chunks').subtree(run_hash)

    for context_idx, context_data in trace_info.items():
        for name, info in context_data.items():
            if info.get('version', 1) == 1:
                trace_data_tree = traces_data_tree.subtree(context_idx).subtree(name)
                item_type = info.get('dtype', 'float')
                migrate_v1_sequence_data(
                    new_run, trace_data_tree,
                    length=info.get('last_step'), item_type=item_type, name=name, context=context_info[context_idx]
                )
            else:  # v2 sequence
                trace_data_tree = v2_traces_data_tree.subtree(context_idx).subtree(name)
                migrate_v2_sequence_data(
                    new_run, trace_data_tree,
                    length=info.get('last_step'), name=name, context=context_info[context_idx]
                )


def get_relational_data(sql_db_path: pathlib.Path) -> Dict:
    def table_exists(tbl):
        res = cursor.execute(f'SELECT count(name) FROM sqlite_master WHERE type=\'table\' AND name=\'{tbl}\';')
        return res.fetchone()[0] == 1

    try:
        import sqlite3
    except ModuleNotFoundError:
        if not click.confirm('Missing package \'sqlite3\'. Cannot migrate Run experiment, tags and notes info. '
                             'Would you like to proceed?'):
            exit(0)
        return {}
    else:
        conn = sqlite3.connect(str(sql_db_path))
        cursor = conn.cursor()
        runs_data = {}

        notes_table_exists = table_exists('note')
        select_notes = 'json_group_array(note.content)' if notes_table_exists else '\'[]\''
        notes_join_clause = 'LEFT OUTER JOIN note ON run.id = note.run_id' if notes_table_exists else ''
        query = RUN_DATA_QUERY_TEMPLATE.format(select_notes=select_notes, notes_join_clause=notes_join_clause)
        for (run_hash, name, desc, archived, exp, tags, notes) in cursor.execute(query):
            runs_data[run_hash] = {
                'name': name,
                'description': desc,
                'archived': archived != 0,
                'experiment': exp,
                'tags': json.loads(tags),
                'notes': json.loads(notes)
            }
        return runs_data


def migrate_data_v3_v4(repo: Repo, v3_repo_path: pathlib.Path, run_hash: Optional[str] = None):
    sql_db_path = v3_repo_path / 'run_metadata.sqlite'
    runs_data = get_relational_data(sql_db_path)

    if run_hash is not None:
        migrate_single_run(repo, v3_repo_path, run_hash=run_hash, run_data=runs_data.get(run_hash))
    else:
        run_hash_list = []
        chunks_dir = v3_repo_path / 'meta' / 'chunks'
        if chunks_dir.exists():
            run_hash_list = list(map(lambda x: x.relative_to(chunks_dir).name, chunks_dir.glob('*')))

        runs_data = get_relational_data(sql_db_path)
        runs_iter = tqdm.tqdm(run_hash_list, leave=False)
        for run_hash in runs_iter:
            runs_iter.set_description(f'Processing Run "{run_hash}"')
            migrate_single_run(repo, v3_repo_path, run_hash=run_hash, run_data=runs_data.get(run_hash))
