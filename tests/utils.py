import datetime
import itertools
import os.path
import random
import shutil
from typing import Iterator
import struct
from sqlalchemy import text as sa_text

from aim.sdk.repo import Repo
from aim.sdk.run import Run
from aim.storage.structured.sql_engine.models import Base as StructuredBase
from aim.web.api.db import get_contexted_session
from aim.web.api.dashboards.models import Base as ApiBase


def decode_encoded_tree_stream(stream: Iterator[bytes]) -> bytes:
    # TODO: handle case when chunk ends at the middle of key/value
    # TODO: if remaining part of chunk cannot be unpacked, prepend to next one and try with new chunk
    for chunk in stream:
        data = chunk
        print("processing chunk: ", len(chunk))
        while data:
            (key_size,), data = struct.unpack('I', data[:4]), data[4:]
            key, data = data[:key_size], data[key_size:]

            (value_size,), data = struct.unpack('I', data[:4]), data[4:]
            value, data = data[:value_size], data[value_size:]

            yield key, value


def truncate_structured_db(db):
    session = db.get_session()
    meta = StructuredBase.metadata
    for table in reversed(meta.sorted_tables):
        session.execute(sa_text(f'DELETE FROM {table.name};'))


def truncate_api_db():
    with get_contexted_session() as session:
        meta = ApiBase.metadata
        for table in reversed(meta.sorted_tables):
            session.execute(sa_text(f'DELETE FROM {table.name};'))
            session.commit()


def create_run_params():
    return {
        'lr': 0.001,
        'batch_size': None
    }


def fill_up_test_data():
    remove_test_data()

    # put dummy data into test repo with 10 runs, tracking 2 metrics over 3 contexts
    repo = Repo.default_repo()
    run_hashes = [hex(random.getrandbits(64))[-7:] for _ in range(10)]

    contexts = [{'is_training': True, 'subset': 'train'},
                {'is_training': True, 'subset': 'val'},
                {'is_training': False}]
    metrics = ['loss', 'accuracy']

    with repo.structured_db:
        try:
            for idx, hash_name in enumerate(run_hashes):
                run = Run(hashname=hash_name, repo=repo, system_tracking_interval=None)
                run['hparams'] = create_run_params()
                run['run_index'] = idx
                run['start_time'] = datetime.datetime.utcnow().isoformat()
                run['name'] = f'Run # {idx}'
                run.props.name = run['name']

                metric_contexts = itertools.product(metrics, contexts)
                for metric_context in metric_contexts:
                    metric = metric_context[0]
                    context = metric_context[1]
                    if metric == 'accuracy' and 'subset' in context:
                        continue
                    else:
                        # track 100 values per run
                        for step in range(100):
                            val = 1.0 - 1.0 / (step + 1)
                            run.track(val, name=metric, step=step, epoch=1, context=context)
        finally:
            del run


def remove_test_data():
    repo = Repo.default_repo()
    repo.container_pool.clear()
    repo.container_view_pool.clear()
    repo.persistent_pool.clear()
    truncate_structured_db(repo.structured_db)

    repo_path_base = repo.path
    shutil.rmtree(os.path.join(repo_path_base, 'meta'), ignore_errors=True)
    shutil.rmtree(os.path.join(repo_path_base, 'trcs'), ignore_errors=True)
    shutil.rmtree(os.path.join(repo_path_base, 'locks'), ignore_errors=True)
    shutil.rmtree(os.path.join(repo_path_base, 'progress'), ignore_errors=True)
