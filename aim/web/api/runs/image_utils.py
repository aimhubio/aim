from typing import Iterable, Tuple, List
from typing import TYPE_CHECKING
from collections import namedtuple

from aim.storage.treeutils import encode_tree

from aim.sdk.objects import Image
from aim.sdk.run import Run
from aim.sdk.sequence_collection import SequenceCollection
from aim.sdk.sequence import Sequence
from aim.sdk.uri_service import URIService, generate_resource_path

from aim.web.api.runs.utils import get_run_props, collect_run_streamable_data

if TYPE_CHECKING:
    from aim.sdk import Repo

IndexRange = namedtuple('IndexRange', ['start', 'stop'])


def sliced_img_record(values: Iterable[Image], _slice: slice) -> Iterable[Image]:
    yield from zip(range(_slice.start, _slice.stop, _slice.step), values[_slice])


def img_record_to_encodable(image_record, trace, step):
    img_list = []
    for idx, img in image_record:
        img_dump = img.json()
        image_resource_path = generate_resource_path(trace.values.tree.container, (step, idx, 'data'))
        img_dump['blob_uri'] = URIService.generate_uri(trace.run.repo, trace.run.hash, 'seqs', image_resource_path)
        img_dump['index'] = idx
        img_list.append(img_dump)
    return img_list


def get_record_and_index_range(traces: SequenceCollection, trace_cache: dict) -> Tuple[IndexRange, IndexRange]:
    rec_start = None
    rec_stop = -1
    idx_start = 0  # record inner indexing is always sequential
    idx_stop = -1
    for run_trace_collection in traces.iter_runs():
        run = run_trace_collection.run
        run_traces = []
        for trace in run_trace_collection.iter():
            run_traces.append(trace)
            rec_start = min(trace.first_step(), rec_start) if rec_start else trace.first_step()
            rec_stop = max(trace.last_step(), rec_stop)
            idx_stop = max(trace.record_length(), idx_stop)
        trace_cache[run.hash] = {
            'run': run,
            'traces': run_traces
        }
    return IndexRange(rec_start, rec_stop), IndexRange(idx_start, idx_stop)


def get_trace_info(trace: Sequence, rec_slice: slice, idx_slice: slice) -> dict:
    steps = []
    values = []
    steps_vals = trace.values.items_slice(_slice=rec_slice)
    for step, val in steps_vals:
        steps.append(step)
        values.append(img_record_to_encodable(sliced_img_record(val, idx_slice), trace, step))

    return {
        'trace_name': trace.name,
        'context': trace.context.to_dict(),
        'values': values,
        'iters': steps,
        'epochs': list(trace.epochs.values_slice(_slice=rec_slice)),
        'timestamps': list(trace.timestamps.values_slice(_slice=rec_slice)),
    }


def image_search_result_streamer(traces: SequenceCollection,
                                 rec_range: IndexRange, rec_density: int,
                                 idx_range: IndexRange, idx_density: int,
                                 calc_total_ranges: bool):
    record_range_missing = rec_range.start is None or rec_range.stop is None
    index_range_missing = idx_range.start is None or idx_range.stop is None
    run_traces = {}

    trcs_rec_range, trcs_idx_range = IndexRange(None, None), IndexRange(None, None)
    if record_range_missing or index_range_missing or calc_total_ranges:
        trcs_rec_range, trcs_idx_range = get_record_and_index_range(traces, trace_cache=run_traces)

    rec_start = rec_range.start if rec_range.start is not None else trcs_rec_range.start
    rec_stop = rec_range.stop if rec_range.stop is not None else trcs_rec_range.stop
    rec_step = (rec_stop - rec_start) // rec_density or 1

    idx_start = idx_range.start if idx_range.start is not None else trcs_idx_range.start
    idx_stop = idx_range.stop if idx_range.stop is not None else trcs_idx_range.stop
    idx_step = (idx_stop - idx_start) // idx_density or 1

    rec_slice = slice(rec_start, rec_stop, rec_step)
    idx_slice = slice(idx_start, idx_stop, idx_step)

    def _pack_run_data(run_: Run, traces_: list):
        _rec_range = trcs_rec_range if record_range_missing or calc_total_ranges else rec_range
        _idx_range = trcs_idx_range if index_range_missing or calc_total_ranges else idx_range

        run_dict = {
            run_.hash: {
                'ranges': {
                    'record_range': [_rec_range.start, _rec_range.stop],
                    'index_range': [_idx_range.start, _idx_range.stop],
                    'record_slice': [rec_slice.start, rec_slice.stop, rec_slice.step],
                    'index_slice': [idx_slice.start, idx_slice.stop, idx_slice.step]
                },
                'params': run_.get(...),
                'traces': traces_,
                'props': get_run_props(run_)
            }
        }
        encoded_tree = encode_tree(run_dict)
        return collect_run_streamable_data(encoded_tree)

    if run_traces:
        for run_info in run_traces.values():
            traces_list = []
            for trace in run_info['traces']:
                traces_list.append(get_trace_info(trace, rec_slice, idx_slice))
            yield _pack_run_data(run_info['run'], traces_list)
    else:
        for run_trace_collection in traces.iter_runs():
            traces_list = []
            for trace in run_trace_collection.iter():
                traces_list.append(get_trace_info(trace, rec_slice, idx_slice))
            yield _pack_run_data(run_trace_collection.run, traces_list)


def images_batch_result_streamer(uri_batch: List[str], repo: 'Repo'):
    # uri_service = URIService(repo=repo)
    # batch_iterator = uri_service.request_batch(uri_batch=uri_batch)
    for uri in uri_batch:
        t = {uri: b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x1c\x00\x00\x00\x1c\x08\x00\x00\x00\x00Wf\x80H\x00\x00\x01\x00IDATx\x9cc`\x18\xcc\x80YHH\xa8\xaec\xbd\xd4\xb2\xff\xdf\xeb\x19\x18\x18\x18X`\x12rlV6\x02\xc1\x0c\x0c\x0c\x0cO&\x05~\xbex\x90\x81\x81\x81\x81\x11*g\xb8\x97\x1f\xca\xfa\x97\xf4\x95\xe1\xd9\xfb\x9b\xc8&\n\xdd\xfe\xfb\xf7\xef\xdf\xbf\xc7\xb6}\xff\x88\xc5\xbe\x809\xd9\x7f\xff\x9e\xe5f\xd0\x9e\x85\xcd5|\x8c\xb3\xfeF\xa1\n1\xc1Y\x9f\xfe\x7fdHab\xc0\x05\xb8\xf7\xfdu\xc3)\xc9\xa0\xfc\xf1\xe1\x82\x1cF\\\xb2\x81\x1f\xfe\xfe-\x97\xc4%\xab\xbb\xeb\xef\xdfi\xd2\xb8d\x05b\xff\xfc\xdd\x8d\xdb\xe2\x9f\x7f\x7f:@\x99,\xa82z!\xa6,\x0c\xd7\x0ea\xd3\xa4>\xe5\xe9\xdf\xbf\x7f\x7fm\xc3"%Qt\xf7\xef\xdf\xbf\x7fO\xfaaJ\x89;]\xfd\xfb\xf7\xef\xdfc\x81\x98\x81$\xb4\xfa\xf6\xdf\xbf\x7f\xff\x1e\x0e\xe0\xc4\x902_\xf3\xe8\xef\xdf\xbf\x7f\xbf\xb4r\xa3\x8a\xb30000\x04\x0620\\\xdf\xfc\xb7\xe7\x036WR\x1f\x00\x00E\x17^\x80kL\x00;\x00\x00\x00\x00IEND\xaeB`\x82'}
        yield collect_run_streamable_data(encode_tree(t))
