import numpy as np
import struct

from typing import Iterator, Tuple, Optional, List

from aim.storage.context import Context
from aim.sdk.run import Run
from aim.sdk.metric import Metric
from aim.sdk.metric import MetricCollection
from aim.web.api.runs.pydantic_models import AlignedRunIn, TraceBase
from aim.storage.treeutils import encode_tree


def get_run_props(run: Run):
    return {
        'name': run.name if run.name else None,
        'experiment': run.experiment.name if run.experiment else None,
        'tags': [{'id': tag.uuid,
                  'name': tag.name,
                  'color': tag.color,
                  'description': tag.description}
                 for tag in run.props.tags],
        'archived': run.archived if run.archived else False,
        'creation_time': run.creation_time,
        'end_time': run.end_time
    }


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


def sliced_np_array(array: np.ndarray, _slice: slice) -> np.ndarray:
    last_step_needed = (_slice.stop - 1) % _slice.step != 0
    if last_step_needed:
        return np.append(array[_slice], array[-1])
    else:
        return array[_slice]


def sliced_array(array: list, _slice: slice) -> list:
    last_step_needed = (_slice.stop - 1) % _slice.step != 0
    if last_step_needed:
        last_value = array[-1]
        return array[_slice] + [last_value]
    else:
        return array[_slice]


def collect_x_axis_data(x_trace: Metric, iters: np.ndarray) -> Tuple[Optional[dict], Optional[dict]]:
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


def collect_run_streamable_data(encoded_tree: Iterator[Tuple[bytes, bytes]]) -> bytes:
    result = bytes()
    for key, val in encoded_tree:
        result += struct.pack('I', len(key)) + key + struct.pack('I', len(val)) + val
    return result


async def custom_aligned_metrics_streamer(requested_runs: List[AlignedRunIn], x_axis: str) -> bytes:
    for run_data in requested_runs:
        run_hashname = run_data.run_id
        requested_traces = run_data.traces
        run = Run(hashname=run_hashname, read_only=True)

        traces_list = []
        for trace_data in requested_traces:
            context = Context(trace_data.context)
            trace = run.get_metric(metric_name=trace_data.metric_name,
                                   context=context)
            x_axis_trace = run.get_metric(metric_name=x_axis,
                                          context=context)
            if not (trace and x_axis_trace):
                continue

            _slice = slice(*trace_data.slice)
            iters = trace.values.sparse_numpy()[0]
            sliced_iters = sliced_np_array(iters, _slice)
            x_axis_iters, x_axis_values = collect_x_axis_data(x_axis_trace, sliced_iters)
            traces_list.append({
                'metric_name': trace.name,
                'context': trace.context.to_dict(),
                'x_axis_values': x_axis_values,
                'x_axis_iters': x_axis_iters,
            })
        run_dict = {
            run_hashname: traces_list
        }
        encoded_tree = encode_tree(run_dict)
        yield collect_run_streamable_data(encoded_tree)


async def metric_search_result_streamer(traces: MetricCollection, steps_num: int, x_axis: Optional[str]) -> bytes:
    for run_trace_collection in traces.iter_runs():
        run = None
        traces_list = []
        for trace in run_trace_collection.iter():
            if not run:
                run = run_trace_collection.run
            iters, values = trace.values.sparse_numpy()
            num_records = len(values)
            step = (num_records // steps_num) or 1
            _slice = slice(0, num_records, step)
            sliced_iters = sliced_np_array(iters, _slice)
            x_axis_trace = run.get_metric(x_axis, trace.context) if x_axis else None
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

        if run:
            run_dict = {
                run.hashname: {
                    'params': run[...],
                    'traces': traces_list,
                    'props': get_run_props(run)
                }
            }

            encoded_tree = encode_tree(run_dict)
            yield collect_run_streamable_data(encoded_tree)


async def run_search_result_streamer(runs: MetricCollection, limit: int) -> bytes:
    run_count = 0
    for run_trace_collection in runs.iter_runs():
        run = run_trace_collection.run
        run_dict = {
            run.hashname: {
                'params': run[...],
                'traces': run.collect_metrics_info(),
                'props': get_run_props(run)
            }
        }

        encoded_tree = encode_tree(run_dict)
        yield collect_run_streamable_data(encoded_tree)

        run_count += 1
        if limit and run_count >= limit:
            break


def collect_requested_traces(run: Run, requested_traces: List[TraceBase], steps_num: int = 200) -> List[dict]:
    processed_traces_list = []
    for requested_trace in requested_traces:
        metric_name = requested_trace.metric_name
        context = Context(requested_trace.context)
        trace = run.get_metric(metric_name=metric_name, context=context)
        if not trace:
            continue

        iters, values = trace.values.sparse_list()

        num_records = len(values)
        step = (num_records // steps_num) or 1
        _slice = slice(0, num_records, step)

        processed_traces_list.append({
            'metric_name': trace.name,
            'context': trace.context.to_dict(),
            'values': sliced_array(values, _slice),
            'iters': sliced_array(iters, _slice),
        })

    return processed_traces_list
