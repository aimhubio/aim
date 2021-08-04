import numpy as np
import struct

from collections import defaultdict
from typing import Iterator, Tuple, Optional, List

from aim.storage.context import Context
from aim.storage.sdk.run import Run
from aim.storage.sdk.trace import Trace
from aim.storage.sdk.trace import QueryTraceCollection, QueryRunTraceCollection


def numpy_to_encodable(array: np.ndarray) -> dict:
    encoded_numpy = {
        '_type': 'numpy',
        'shape': array.shape[0],
    }

    if array.dtype == 'int64':
        encoded_numpy.update({
            'dtype': 'float64',
            'blob': array.astype('float64').tobytes()
        })
    else:
        encoded_numpy.update({
            'dtype': str(array.dtype),
            'blob': array.tobytes()
        })

    return encoded_numpy


def sliced_np_array(array: np.ndarray, _slice: slice) -> np.ndarray:
    last_step_needed = (_slice.stop - 1) % _slice.step != 0
    if last_step_needed:
        return np.append(array[_slice], array[-1])
    else:
        return array[_slice]


def collect_x_axis_data(x_trace: Trace, iters: np.ndarray) -> Tuple[Optional[dict], Optional[dict]]:
    if not x_trace:
        return None, None

    x_axis_values = []
    x_axis_iters = []
    for idx in iters:
        x_val = x_trace.values[idx.item()]
        if x_val:
            x_axis_iters.append(idx.item())
            x_axis_values.append(x_val)

    if not x_axis_iters:
        return None, None

    return numpy_to_encodable(np.array(x_axis_iters, dtype='float64')),\
        numpy_to_encodable(np.array(x_axis_values, dtype='float64'))


def aligned_traces_dict_constructor(requested_runs: list, x_axis: str) -> dict:
    processed_runs_dict = {}
    for run_data in requested_runs:
        run_name = run_data.get('name')
        requested_traces = run_data.get('traces')
        run = Run(hashname=run_name)

        traces_list = []
        for trace_data in requested_traces:
            context = Context(trace_data.get('context'))
            trace = run.get_trace(metric_name=trace_data.get('metric_name'),
                                  context=context)
            x_axis_trace = run.get_trace(metric_name=x_axis,
                                         context=context)
            if not (trace and x_axis_trace):
                continue

            _slice = slice(*trace_data.get('slice'))
            iters = trace.values.sparse_numpy()[0]
            sliced_iters = sliced_np_array(iters, _slice)
            x_axis_iters, x_axis_values = collect_x_axis_data(x_axis_trace, sliced_iters)
            traces_list.append({
                'metric_name': trace.name,
                'context': trace.context.to_dict(),
                'x_axis_values': x_axis_values,
                'x_axis_iters': x_axis_iters,
            })

        processed_runs_dict[run_name] = traces_list

    return processed_runs_dict


def query_traces_dict_constructor(traces: QueryTraceCollection, steps_num: int, x_axis: Optional[str]) -> dict:
    query_runs_collection = defaultdict(list)
    for trace in traces.iter():
        query_runs_collection[trace.run.hashname].append(trace)

    runs_dict = {}
    for run_name in query_runs_collection.keys():
        run = Run(hashname=run_name)
        query_run_traces = query_runs_collection[run_name]
        traces_list = []
        for trace in query_run_traces:
            iters, values = trace.values.sparse_numpy()
            num_records = len(values)
            step = (num_records // steps_num) or 1
            _slice = slice(0, num_records, step)
            sliced_iters = sliced_np_array(iters, _slice)
            x_axis_trace = run.get_trace(x_axis, trace.context) if x_axis else None
            x_axis_iters, x_axis_values = collect_x_axis_data(x_axis_trace, sliced_iters)

            traces_list.append({
                    'metric_name': trace.name,
                    'context': trace.context.to_dict(),
                    'slice': [0, num_records, step],
                    'values': numpy_to_encodable(sliced_np_array(values, _slice)),
                    'iters': numpy_to_encodable(sliced_iters),
                    'epochs': numpy_to_encodable(sliced_np_array(trace.epochs.values_numpy(), _slice)),
                    'timestamps': numpy_to_encodable(sliced_np_array(trace.timestamps.values_numpy(), _slice)),
                    'x_axis_values': x_axis_values,
                    'x_axis_iters': x_axis_iters,
                })

        runs_dict[run.hashname] = {
            'params': run.get_params(),
            'traces': traces_list,
            'created_at': run.created_at,
        }

    return runs_dict


def query_runs_dict_constructor(runs: QueryRunTraceCollection) -> dict:
    runs_dict = {}
    for run_trace_collection in runs.iter_runs():
        run = run_trace_collection.run
        runs_dict[run.hashname] = {
            'params': run.get_params(),
            'traces': run.get_traces_overview(),
            'created_at': run.created_at,
        }

    return runs_dict


def collect_requested_traces(run: Run, requested_traces: dict, steps_num: int = 200) -> List[dict]:
    processed_traces_list = []
    for requested_trace in requested_traces:
        metric_name = requested_trace.get('metric_name')
        context = requested_trace.get('context')
        trace = run.get_trace(metric_name=metric_name, context=context)
        if not trace:
            continue

        iters, values = trace.values.sparse_numpy()

        num_records = len(values)
        step = (num_records // steps_num) or 1
        _slice = slice(0, num_records, step)

        processed_traces_list.append({
            'metric_name': metric_name,
            'context': context,
            'values': numpy_to_encodable(sliced_np_array(values, _slice)),
            'iters': numpy_to_encodable(sliced_np_array(iters, _slice)),
        })

    return processed_traces_list


async def encoded_tree_streamer(encoded_runs_tree: Iterator[Tuple[bytes, bytes]]) -> bytes:
    for key, val in encoded_runs_tree:
        yield struct.pack('I', len(key)) + key + struct.pack('I', len(val)) + val


# TODO: [MV] don't forget to delete this block
# remains here for Karen to convert old storage files to new one
import json

from aim.artifacts.metric import Metric as MetricArtifact
from aim.engine.repo.run import Run as OldRun
from aim.ql.grammar import Expression
from aim.ql.utils import match
from aim.web.adapters.tf_summary_adapter import TFSummaryAdapter
from aim.web.api.commits.models import TFSummaryLog
from aim.web.api.utils import normalize_type, unsupported_float_type


def select_tf_summary_scalars(session, tags, expression: Optional[Expression] = None):
    # Search
    runs = []

    params = {}
    scalars_models = session.query(TFSummaryLog).all()
    for scalar in scalars_models:
        scalar_params = json.loads(scalar.params)
        for k, v in scalar_params.items():
            scalar_params[k] = normalize_type(v)
        params[scalar.log_path] = scalar_params

    if expression is not None:
        log_paths = []
        for scalar in scalars_models:
            hparams = {
                'params': params[scalar.log_path],
            }
            fields = {
                'params': hparams,
                'context': None,
            }
            if match(False, expression, None, fields, hparams):
                log_paths.append(scalar.log_path)
    else:
        log_paths = TFSummaryAdapter.list_log_dir_paths()

    # Get scalar paths
    for log_path in log_paths:
        tf = TFSummaryAdapter(log_path)
        scalars = tf.get_scalars(tags)
        dir_scalars = scalars['scalars']
        start_time = int(scalars['start_time']) \
            if isinstance(scalars['start_time'], (int, float)) else 0
        if dir_scalars and len(dir_scalars) > 0:
            runs.append({
                'name': log_path,
                'date': start_time,
                'run_hash': TFSummaryAdapter.name_to_hash(log_path),
                'experiment_name': 'TF',
                'metrics': dir_scalars,
                'params': {
                    'params': params.get(log_path) or {},
                },
                'source': 'tf_summary',
            })

    return runs


def scale_trace_steps(max_metric_len, max_steps):
    scaled_steps_len = max_steps
    if scaled_steps_len > max_metric_len:
        scaled_steps_len = max_metric_len
    if scaled_steps_len:
        scaled_steps = slice(0, max_metric_len,
                             max_metric_len // scaled_steps_len)
    else:
        scaled_steps = slice(0, 0)
    return scaled_steps


def separate_select_statement(select: list) -> tuple:
    aim_select = []
    tf_select = []

    for s in select:
        if s.startswith('tf:'):
            adapter, _, name = s.partition(':')
            tf_select.append(name)
        else:
            aim_select.append(s)

    return aim_select, tf_select


def is_tf_run(run) -> bool:
    return isinstance(run, dict) and run.get('source') == 'tf_summary'


def process_trace_record(r, trace, x_axis_trace, x_idx):
    base, metric_record = MetricArtifact.deserialize_pb(r)
    if unsupported_float_type(metric_record.value):
        return

    if x_axis_trace is not None:
        # try to initialize new value for x_axis from already available sources
        if x_axis_trace.metric == trace.metric:
            new_x_axis_value = metric_record.value
        else:
            new_x_axis_value = x_axis_trace.tmp_data.get(x_idx)
        if new_x_axis_value:
            if x_axis_trace.current_x_axis_value and new_x_axis_value < x_axis_trace.current_x_axis_value:
                trace.alignment['is_asc'] = False
            x_axis_trace.current_x_axis_value = new_x_axis_value
        else:
            # if there was no available value for x_idx index from available sources read from storage
            try:
                x_r = next(x_axis_trace.read_records(x_idx))
                _, x_axis_metric_record = MetricArtifact.deserialize_pb(x_r)
                if not unsupported_float_type(x_axis_metric_record.value):
                    new_x_axis_value = x_axis_metric_record.value
                    if x_axis_trace.current_x_axis_value and \
                            new_x_axis_value < x_axis_trace.current_x_axis_value:
                        trace.alignment['is_asc'] = False
                    x_axis_trace.current_x_axis_value = new_x_axis_value
                    x_axis_trace.tmp_data[x_idx] = x_axis_trace.current_x_axis_value
                else:
                    trace.alignment['skipped_steps'] += 1
            except StopIteration:
                trace.alignment['is_synced'] = False
    trace.append((
        metric_record.value,
        base.step,
        base.epoch if base.has_epoch else None,
        base.timestamp,
        x_axis_trace.current_x_axis_value if x_axis_trace else None
    ))


def process_custom_aligned_run(project, run_data, x_axis_metric_name) -> OldRun or None:
    # get run_hash and experiment_name from request data
    run_hash = run_data.get('run_hash')
    experiment_name = run_data.get('experiment_name')
    if run_hash is None or experiment_name is None:
        return None

    # initialize Run object and try to get metric corresponding to x_axis_metric_name
    selected_run = OldRun(project.repo, experiment_name, run_hash)
    x_axis_metric = selected_run.get_all_metrics().get(x_axis_metric_name)
    if x_axis_metric is None:
        return None

    # open run storage and metric artifact
    try:
        selected_run.open_storage()
        x_axis_metric.open_artifact()
    except:
        return None

    # collect selected metrics and traces
    for metric in run_data.get('metrics'):
        metric_name = metric.get('name')
        selected_metric = selected_run.get_all_metrics().get(metric_name)
        if selected_metric is None:
            continue
        for trace in metric.get('traces'):
            trace_context = trace.get('context')
            # get the corresponding traces for x_axis_metric and selected_metric
            selected_trace = selected_metric.get_trace(trace_context)
            x_axis_trace = x_axis_metric.get_trace(trace_context)
            if x_axis_trace is None or selected_trace is None:
                continue
            # initialize alignment fields for selected_trace
            selected_trace.alignment = {
                'is_synced': True,
                'is_asc': True,
                'skipped_steps': 0,
                'aligned_by': {
                    'metric_name': x_axis_metric.name,
                    'trace_context': x_axis_trace.context
                }
            }

            def process_single_x_axis_trace_record(x_idx):
                new_x_axis_value = x_axis_trace.tmp_data.get(x_idx)
                if not new_x_axis_value:
                    # if there was no available value for x_idx index from trace cached data, read from storage
                    try:
                        x_r = next(x_axis_trace.read_records(x_idx))
                        _, x_axis_metric_record = MetricArtifact.deserialize_pb(x_r)
                        if not unsupported_float_type(x_axis_metric_record.value):
                            new_x_axis_value = x_axis_metric_record.value
                            x_axis_trace.tmp_data[x_idx] = new_x_axis_value
                        else:
                            selected_trace.alignment['skipped_steps'] += 1
                    except StopIteration:
                        selected_trace.alignment['is_synced'] = False
                if new_x_axis_value:
                    # check if the resulting array is ascending or not
                    if x_axis_trace.current_x_axis_value and \
                            new_x_axis_value < x_axis_trace.current_x_axis_value:
                        selected_trace.alignment['is_asc'] = False
                    x_axis_trace.current_x_axis_value = new_x_axis_value
                return new_x_axis_value

            # get values of x_axis_trace and store them in the data attribute of selected_trace as a plain list
            start, stop, step = trace.get('slice')
            for i in range(start, stop, step):
                selected_trace.append(process_single_x_axis_trace_record(i))
            if (stop-1) % step != 0:
                selected_trace.append(process_single_x_axis_trace_record(stop-1))
            # clear current_x_axis_value for x_axis_trace for the next possible iteration
            x_axis_trace.current_x_axis_value = None

            selected_metric.append(selected_trace)
        selected_run.add(selected_metric)

    # close run storage and metric artifact
    try:
        selected_run.close_storage()
        x_axis_metric.close_artifact()
    except:
        pass

    return selected_run


def runs_resp_generator(response, runs, exclude_list=None):
    yield json.dumps({
        'header': response,
    }).encode() + '\n'.encode()
    for run in runs:
        if not is_tf_run(run):
            yield json.dumps({
                'run': run.to_dict(include_only_selected_agg_metrics=True, exclude_list=exclude_list),
            }).encode() + '\n'.encode()
        else:
            yield json.dumps({
                'run': run,
            }).encode() + '\n'.encode()
