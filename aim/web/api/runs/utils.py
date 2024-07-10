import asyncio
import random
import struct
import time

from collections import namedtuple
from itertools import chain
from typing import TYPE_CHECKING, Iterator, List, Optional, Tuple

import numpy as np

from aim.sdk import Run
from aim.sdk.sequence_collection import SequenceCollection
from aim.sdk.sequences.metric import Metric
from aim.storage.context import Context
from aim.storage.query import syntax_error_check
from aim.storage.treeutils import encode_tree
from aim.web.api.projects.project import Project
from aim.web.api.runs.pydantic_models import AlignedRunIn, TraceBase
from aim.web.configs import AIM_PROGRESS_REPORT_INTERVAL
from fastapi import HTTPException


if TYPE_CHECKING:
    from aim.sdk import Repo

IndexRange = namedtuple('IndexRange', ['start', 'stop'])

# added to progress keys to escape buffering due to gzipping responses
PROGRESS_KEY_SUFFIX = ''.join([str(hash(random.random())) for _ in range(2000)])

# Used for async sleep to mimic real async streamer
# reference here
# https://github.com/tiangolo/fastapi/issues/4146
ASYNC_SLEEP_INTERVAL = 0.00001


def get_run_or_404(run_id, repo=None):
    if repo is None:
        repo = get_project_repo()

    run = repo.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail='Run not found.')

    return run


def str_to_range(range_str: str):
    defaults = [None, None]
    slice_values = chain(range_str.strip().split(':'), defaults)

    start, stop, step, *_ = map(lambda x: int(x) if x else None, slice_values)
    return IndexRange(start, stop)


def convert_nan_and_inf_to_str(tree):
    if tree == float('inf'):
        return 'inf'
    if tree == float('-inf'):
        return '-inf'
    if tree != tree:  # x == x is False for NaN, strings break math.isnan
        return 'NaN'
    if isinstance(tree, dict):
        return {key: convert_nan_and_inf_to_str(value) for key, value in tree.items()}
    if isinstance(tree, tuple):
        return tuple(convert_nan_and_inf_to_str(value) for value in tree)
    if isinstance(tree, list):
        return [convert_nan_and_inf_to_str(value) for value in tree]
    return tree


def get_run_params(run: Run, *, skip_system: bool):
    params = run.get(..., {}, resolve_objects=True)
    if skip_system and '__system_params' in params:
        del params['__system_params']
    return params


def get_run_props(run: Run):
    return {
        'name': run.name if run.name else None,
        'description': run.description if run.description else None,
        'experiment': {
            'id': run.props.experiment_obj.uuid,
            'name': run.props.experiment_obj.name,
            'description': run.props.experiment_obj.description,
        }
        if run.props.experiment_obj
        else None,
        'tags': [
            {'id': tag.uuid, 'name': tag.name, 'color': tag.color, 'description': tag.description}
            for tag in run.props.tags_obj
        ],
        'archived': run.archived if run.archived else False,
        'creation_time': run.creation_time,
        'end_time': run.end_time,
        'active': run.active,
    }


def get_run_artifacts(run: Run):
    artifacts_info = []
    for artifact in run.artifacts.values():
        artifacts_info.append(
            {
                'name': artifact.name,
                'path': artifact.path,
                'uri': artifact.uri,
            }
        )
    return artifacts_info


def numpy_to_encodable(array: np.ndarray) -> Optional[dict]:
    encoded_numpy = {
        'type': 'numpy',
        'shape': array.shape[0],
        'dtype': 'float64',  # hardcoded for now
    }

    if array.dtype == 'float64':
        encoded_numpy['blob'] = array.tobytes()
    elif array.dtype == 'object':
        return None
    else:
        encoded_numpy['blob'] = array.astype('float64').tobytes()
    return encoded_numpy


def collect_x_axis_data(x_trace: Metric, iters: np.ndarray) -> Tuple[Optional[dict], Optional[dict]]:
    if not x_trace:
        return None, None

    x_axis_values = []
    x_axis_iters = []
    step_index_fn = x_trace.data.step_hash
    for idx in iters:
        try:
            x_val = x_trace.values[step_index_fn(idx.item())]
        except KeyError:
            x_val = None
        if x_val:
            x_axis_iters.append(step_index_fn(idx.item()))
            x_axis_values.append(x_val)

    if not x_axis_iters:
        return None, None

    return (
        numpy_to_encodable(np.array(x_axis_iters, dtype='float64')),
        numpy_to_encodable(np.array(x_axis_values, dtype='float64')),
    )


def collect_streamable_data(encoded_tree: Iterator[Tuple[bytes, bytes]]) -> bytes:
    result = [struct.pack('I', len(key)) + key + struct.pack('I', len(val)) + val for key, val in encoded_tree]
    return b''.join(result)


async def custom_aligned_metrics_streamer(requested_runs: List[AlignedRunIn], x_axis: str, repo: 'Repo') -> bytes:
    try:
        for run_data in requested_runs:
            await asyncio.sleep(ASYNC_SLEEP_INTERVAL)
            run_hash = run_data.run_id
            requested_traces = run_data.traces
            run = Run(run_hash, repo=repo, read_only=True)

            traces_list = []
            for trace_data in requested_traces:
                context = Context(trace_data.context)
                trace = run.get_metric(name=trace_data.name, context=context)
                x_axis_trace = run.get_metric(name=x_axis, context=context)
                if not (trace and x_axis_trace):
                    continue

                iters = np.array(trace.data.sample(trace_data.slice[-1]).indices_list())
                x_axis_iters, x_axis_values = collect_x_axis_data(x_axis_trace, iters)
                traces_list.append(
                    {
                        'name': trace.name,
                        'context': trace.context.to_dict(),
                        'x_axis_values': x_axis_values,
                        'x_axis_iters': x_axis_iters,
                    }
                )
            run_dict = {run_hash: traces_list}
            encoded_tree = encode_tree(run_dict)
            yield collect_streamable_data(encoded_tree)
    except asyncio.CancelledError:
        pass


async def metric_search_result_streamer(
    traces: SequenceCollection,
    skip_system: bool,
    steps_num: int,
    x_axis: Optional[str] = None,
    report_progress: Optional[bool] = True,
) -> bytes:
    try:
        last_reported_progress_time = time.time()
        progress = None
        progress_reports_sent = 0
        for run_trace_collection, progress in traces.iter_runs():
            await asyncio.sleep(ASYNC_SLEEP_INTERVAL)
            if report_progress and time.time() - last_reported_progress_time > AIM_PROGRESS_REPORT_INTERVAL:
                yield collect_streamable_data(
                    encode_tree({f'progress_{progress_reports_sent}_{PROGRESS_KEY_SUFFIX}': progress})
                )
                progress_reports_sent += 1
                last_reported_progress_time = time.time()

            run = None
            traces_list = []
            for trace in run_trace_collection.iter():
                if not run:
                    run = run_trace_collection.run
                iters, (values, epochs, timestamps) = trace.data.sample(steps_num).numpy()

                x_axis_trace = run.get_metric(x_axis, trace.context) if x_axis else None
                x_axis_iters, x_axis_values = collect_x_axis_data(x_axis_trace, iters)

                traces_list.append(
                    {
                        'name': trace.name,
                        'context': trace.context.to_dict(),
                        'slice': [0, 0, steps_num],  # TODO [AT] change once UI is ready
                        'values': numpy_to_encodable(values),
                        'iters': numpy_to_encodable(iters),
                        'epochs': numpy_to_encodable(epochs),
                        'timestamps': numpy_to_encodable(timestamps),
                        'x_axis_values': x_axis_values,
                        'x_axis_iters': x_axis_iters,
                    }
                )

            if run:
                run_dict = {
                    run.hash: {
                        'params': get_run_params(run, skip_system=skip_system),
                        'traces': traces_list,
                        'props': get_run_props(run),
                    }
                }

                encoded_tree = encode_tree(run_dict)
                yield collect_streamable_data(encoded_tree)
                if report_progress:
                    yield collect_streamable_data(encode_tree({f'progress_{progress_reports_sent}': progress}))
                    progress_reports_sent += 1
                    last_reported_progress_time = time.time()

        if report_progress and progress:
            yield collect_streamable_data(encode_tree({f'progress_{progress_reports_sent}': progress}))
    except asyncio.CancelledError:
        pass


async def run_search_result_streamer(
    runs: SequenceCollection,
    limit: int,
    skip_system: bool,
    report_progress: Optional[bool] = True,
    exclude_params: Optional[bool] = False,
    exclude_traces: Optional[bool] = False,
) -> bytes:
    try:
        run_count = 0
        last_reported_progress_time = time.time()
        progress = None
        progress_reports_sent = 0
        for run_trace_collection, progress in runs.iter_runs():
            await asyncio.sleep(ASYNC_SLEEP_INTERVAL)
            # if no progress was reported for a long interval, report progress
            if report_progress and time.time() - last_reported_progress_time > AIM_PROGRESS_REPORT_INTERVAL:
                yield collect_streamable_data(
                    encode_tree({f'progress_{progress_reports_sent}_{PROGRESS_KEY_SUFFIX}': progress})
                )
                progress_reports_sent += 1
                last_reported_progress_time = time.time()
            if not run_trace_collection:
                continue
            run = run_trace_collection.run
            run_dict = {run.hash: {'props': get_run_props(run)}}
            if not exclude_params:
                run_dict[run.hash]['params'] = get_run_params(run, skip_system=skip_system)
            if not exclude_traces:
                run_dict[run.hash]['traces'] = run.collect_sequence_info(sequence_types='metric')

            encoded_tree = encode_tree(run_dict)
            yield collect_streamable_data(encoded_tree)
            if report_progress:
                yield collect_streamable_data(encode_tree({f'progress_{progress_reports_sent}': progress}))
                progress_reports_sent += 1
                last_reported_progress_time = time.time()
            run_count += 1
            if limit and run_count >= limit:
                break

        if report_progress and progress:
            yield collect_streamable_data(encode_tree({f'progress_{progress_reports_sent}': progress}))
    except asyncio.CancelledError:
        pass


async def run_active_result_streamer(repo: 'Repo', report_progress: Optional[bool] = True):
    try:
        active_run_hashes = repo.list_active_runs()

        active_runs_count = len(active_run_hashes)
        progress_reports_sent = 0

        for run_hash in active_run_hashes:
            await asyncio.sleep(ASYNC_SLEEP_INTERVAL)

            run = Run(run_hash, repo=repo, read_only=True)
            if run.active:
                run_dict = {
                    run.hash: {
                        'props': get_run_props(run),
                        'traces': run.collect_sequence_info(sequence_types='metric'),
                    }
                }

                encoded_tree = encode_tree(run_dict)
                yield collect_streamable_data(encoded_tree)

            if report_progress:
                yield collect_streamable_data(
                    encode_tree({f'progress_{progress_reports_sent}': (progress_reports_sent + 1, active_runs_count)})
                )
                progress_reports_sent += 1
    except asyncio.CancelledError:
        pass


def collect_requested_metric_traces(run: Run, requested_traces: List[TraceBase], steps_num: int = 200) -> List[dict]:
    processed_traces_list = []
    for requested_trace in requested_traces:
        metric_name = requested_trace.name
        context = Context(requested_trace.context)
        trace = run.get_metric(name=metric_name, context=context)
        if not trace:
            continue

        iters, (values,) = trace.data.view('val').sample(steps_num).items_list()
        values = list(map(lambda x: x if float('-inf') < x < float('inf') and x == x else None, values))

        processed_traces_list.append(
            {
                'name': trace.name,
                'context': trace.context.to_dict(),
                'values': values,
                'iters': iters,
            }
        )

    return processed_traces_list


async def run_logs_streamer(run: Run, record_range: str) -> bytes:
    logs = run.get_terminal_logs()

    if not logs:
        return

    record_range = checked_range(record_range)
    start = record_range.start
    stop = record_range.stop

    # range stop is missing
    if record_range.stop is None:
        stop = logs.last_step() + 1

    # range start is missing
    if record_range.start is None:
        start = 0

    # range is missing completely
    if record_range.start is None and record_range.stop is None:
        start = max(logs.last_step() - 200, 0)

    try:
        steps_vals = logs.data.view('val').range(start, stop)
        for step, (val,) in steps_vals:
            await asyncio.sleep(ASYNC_SLEEP_INTERVAL)
            encoded_tree = encode_tree({step: val.data})
            yield collect_streamable_data(encoded_tree)
    except asyncio.CancelledError:
        pass


async def run_log_records_streamer(run: Run, record_range: str) -> bytes:
    logs = run.get_log_records()

    if not logs:
        return

    record_range = checked_range(record_range)
    start = record_range.start
    stop = record_range.stop

    # range stop is missing
    if record_range.stop is None:
        stop = logs.last_step() + 1

    # range start is missing
    if record_range.start is None:
        start = 0

    # range is missing completely
    log_records_count = logs.last_step() + 1

    if record_range.start is None and record_range.stop is None:
        start = max(log_records_count - 200, 0)

    last_notified_log_step = run.props.info.last_notification_index

    try:
        yield collect_streamable_data(encode_tree({'log_records_count': log_records_count}))
        steps_vals = logs.data.view('val').range(start, stop)
        for step, (val,) in steps_vals:
            await asyncio.sleep(ASYNC_SLEEP_INTERVAL)
            result = val.json()
            result['is_notified'] = step >= last_notified_log_step
            encoded_tree = encode_tree({step: result})
            yield collect_streamable_data(encoded_tree)
    except asyncio.CancelledError:
        pass


def get_project():
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)
    return project


def get_project_repo():
    project = get_project()
    return project.repo


def checked_query(q: str):
    query = q.strip()
    try:
        syntax_error_check(query)
    except SyntaxError as se:
        raise HTTPException(
            status_code=400,
            detail={
                'message': 'SyntaxError',
                'detail': {
                    'statement': se.text,
                    'line': se.lineno,
                    'offset': se.offset,
                    'end_offset': getattr(se, 'end_offset', 0),
                },
            },
        )
    return query


def checked_range(range_: str = ''):
    try:
        range_ = str_to_range(range_)
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid range format')
    return range_
