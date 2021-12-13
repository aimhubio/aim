import json
from typing import List
from typing import TYPE_CHECKING

from aim.sdk.sequence import Sequence
from aim.sdk.sequence_collection import SequenceCollection
from aim.storage.treeutils import encode_tree

from aim.storage.context import Context
from aim.sdk.objects import Figure
from aim.sdk.run import Run
from aim.sdk.uri_service import URIService, generate_resource_path

from aim.web.api.runs.utils import (
    collect_run_streamable_data,
    IndexRange,
    get_run_props,
)
from aim.web.api.runs.pydantic_models import TraceBase

if TYPE_CHECKING:
    from aim.sdk import Repo


def preparer(obj: Figure, trace, step, decode=False):
    assert isinstance(obj, Figure)

    if decode:
        return json.loads(obj.json())
    resource_path = generate_resource_path(trace.values.tree.container, (step, 'data'))
    return {
        'blob_uri': URIService.generate_uri(
            trace.run.repo, trace.run.hash, 'seqs', resource_path
        )
    }


def get_record_and_index_range(
        traces: SequenceCollection, trace_cache: dict
) -> IndexRange:
    rec_start = None
    rec_stop = -1
    for run_trace_collection in traces.iter_runs():
        run = run_trace_collection.run
        run_traces = []
        for trace in run_trace_collection.iter():
            run_traces.append(trace)
            rec_start = (
                min(trace.first_step(), rec_start) if rec_start else trace.first_step()
            )
            rec_stop = max(trace.last_step(), rec_stop)
        if run_traces:
            trace_cache[run.hash] = {'run': run, 'traces': run_traces}
    return IndexRange(rec_start, rec_stop + 1)


def get_trace_info(trace: Sequence, rec_slice: slice, rec_density: int) -> dict:
    steps = []
    values = []
    steps_vals = trace.values.items_in_range(
        rec_slice.start, rec_slice.stop, rec_density
    )
    for step, val in steps_vals:
        steps.append(step)
        values.append(preparer(val, trace, step))
    return {
        'name': trace.name,
        'context': trace.context.to_dict(),
        'values': values,
        'iters': steps,
        'epochs': list(
            trace.epochs.values_in_range(rec_slice.start, rec_slice.stop, rec_density)
        ),
        'timestamps': list(
            trace.timestamps.values_in_range(
                rec_slice.start, rec_slice.stop, rec_density
            )
        ),
    }


async def figure_search_result_streamer(
        traces: SequenceCollection,
        rec_range: IndexRange,
        rec_density: int,
        calc_total_ranges: bool,
):
    record_range_missing = rec_range.start is None or rec_range.stop is None
    run_traces = {}

    trcs_rec_range = IndexRange(None, None)
    if record_range_missing or calc_total_ranges:
        trcs_rec_range = get_record_and_index_range(traces, trace_cache=run_traces)
        if not run_traces:
            return

    rec_start = rec_range.start if rec_range.start is not None else trcs_rec_range.start
    rec_stop = rec_range.stop if rec_range.stop is not None else trcs_rec_range.stop
    rec_step = (rec_stop - rec_start) // rec_density or 1

    rec_slice = slice(rec_start, rec_stop, rec_step)

    def _pack_run_data(run_: Run, traces_: list):
        _rec_range = (
            trcs_rec_range if record_range_missing or calc_total_ranges else rec_range
        )

        run_dict = {
            run_.hash: {
                'ranges': {
                    'record_range': [_rec_range.start, _rec_range.stop],
                    'record_slice': [rec_slice.start, rec_slice.stop, rec_slice.step],
                },
                'params': run_.get(...),
                'traces': traces_,
                'props': get_run_props(run_),
            }
        }
        encoded_tree = encode_tree(run_dict)
        return collect_run_streamable_data(encoded_tree)

    if run_traces:
        for run_info in run_traces.values():
            traces_list = []
            for trace in run_info['traces']:
                traces_list.append(get_trace_info(trace, rec_slice, rec_density))
            yield _pack_run_data(run_info['run'], traces_list)
    else:
        for run_trace_collection in traces.iter_runs():
            traces_list = []
            for trace in run_trace_collection.iter():
                traces_list.append(get_trace_info(trace, rec_slice, rec_density))
            if traces_list:
                yield _pack_run_data(run_trace_collection.run, traces_list)


def figure_batch_result_streamer(uri_batch: List[str], repo: 'Repo'):
    uri_service = URIService(repo=repo)
    batch_iterator = uri_service.request_batch(uri_batch=uri_batch)
    for it in batch_iterator:
        yield collect_run_streamable_data(encode_tree(it))


def requested_figure_object_traces_streamer(
        run: Run, requested_traces: List[TraceBase], rec_range, rec_num: int = 50
) -> List[dict]:
    for requested_trace in requested_traces:
        trace_name = requested_trace.name
        context = Context(requested_trace.context)
        trace = run.get_figure_sequence(name=trace_name, context=context)
        if not trace:
            continue

        record_range_missing = rec_range.start is None or rec_range.stop is None
        if record_range_missing:
            rec_range = IndexRange(trace.first_step(), trace.last_step() + 1)

        steps = []
        values = []
        steps_vals = trace.values.items_in_range(
            rec_range.start, rec_range.stop, rec_num
        )
        for step, val in steps_vals:
            steps.append(step)
            values.append(preparer(val, trace, step, decode=True))

        trace_dict = {
            'name': trace.name,
            'context': trace.context.to_dict(),
            'values': values,
            'iters': steps,
            'record_range': (trace.first_step(), trace.last_step() + 1),
        }
        encoded_tree = encode_tree(trace_dict)
        yield collect_run_streamable_data(encoded_tree)
