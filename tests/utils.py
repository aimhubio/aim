import datetime
import itertools
import os.path
import random
import shutil
import numpy
from PIL import Image as pil_image

from typing import Iterator
import struct
from sqlalchemy import text as sa_text

from aim.sdk.repo import Repo
from aim.sdk.run import Run
from aim.sdk.objects.image import Image as AimImage
from aim.storage.structured.sql_engine.models import Base as StructuredBase
from aim.web.api.db import get_contexted_session
from aim.web.api.db import Base as ApiBase


def decode_encoded_tree_stream(stream: Iterator[bytes], concat_chunks=False) -> bytes:
    # TODO: handle case when chunk ends at the middle of key/value
    # TODO: if remaining part of chunk cannot be unpacked, prepend to next one and try with new chunk
    prev_chunk_tail = b''
    if concat_chunks:
        data = b''
        for chunk in stream:
            data += chunk
        while data:
            (key_size,), data_tail = struct.unpack('I', data[:4]), data[4:]
            key, data_tail = data_tail[:key_size], data_tail[key_size:]

            (value_size,), data_tail = struct.unpack('I', data_tail[:4]), data_tail[4:]
            value, data_tail = data_tail[:value_size], data_tail[value_size:]
            data = data_tail
            yield key, value
    else:
        for chunk in stream:
            data = prev_chunk_tail + chunk
            prev_chunk_tail = b''
            print("processing chunk: ", len(chunk))
            while data:
                try:
                    (key_size,), data_tail = struct.unpack('I', data[:4]), data[4:]
                    key, data_tail = data_tail[:key_size], data_tail[key_size:]

                    (value_size,), data_tail = struct.unpack('I', data_tail[:4]), data_tail[4:]
                    value, data_tail = data_tail[:value_size], data_tail[value_size:]
                    data = data_tail
                except Exception:
                    prev_chunk_tail = data
                    break

                yield key, value

        assert prev_chunk_tail == b''


def generate_image_set(img_count, caption_prefix='Image', img_size=(16, 16)):
    return [AimImage(
        pil_image.fromarray((numpy.random.rand(img_size[0], img_size[1], 3) * 255).astype('uint8')),
        f'{caption_prefix} {idx}'
    ) for idx in range(img_count)]


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
        runs = []
        for idx, run_hash in enumerate(run_hashes):
            run = Run(run_hash, repo=repo, system_tracking_interval=None)
            run['hparams'] = create_run_params()
            run['run_index'] = idx
            run['start_time'] = datetime.datetime.utcnow().isoformat()
            run['name'] = f'Run # {idx}'
            run.name = run['name']
            runs.append(run)
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
        for run in runs:
            run.finalize()


def remove_test_data():
    repo = Repo.default_repo()
    repo.container_pool.clear()
    repo.container_view_pool.clear()
    repo.persistent_pool.clear()
    truncate_structured_db(repo.structured_db)

    repo_path_base = repo.path
    shutil.rmtree(os.path.join(repo_path_base, 'meta'), ignore_errors=True)
    shutil.rmtree(os.path.join(repo_path_base, 'seqs'), ignore_errors=True)
    shutil.rmtree(os.path.join(repo_path_base, 'locks'), ignore_errors=True)
    shutil.rmtree(os.path.join(repo_path_base, 'progress'), ignore_errors=True)
