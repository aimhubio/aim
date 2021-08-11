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


def sliced_array(array: list, _slice: slice) -> list:
    last_step_needed = (_slice.stop - 1) % _slice.step != 0
    if last_step_needed:
        last_value = array[-1]
        return array[_slice].append(last_value)
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
            'params': run[...],
            'traces': traces_list,
            'created_at': run.creation_time,
        }

    return runs_dict


def query_runs_dict_constructor(runs: QueryRunTraceCollection) -> dict:
    runs_dict = {}
    for run_trace_collection in runs.iter_runs():
        run = run_trace_collection.run
        runs_dict[run.hashname] = {
            'params': run[...],
            'traces': run.get_traces_overview(),
            'created_at': run.creation_time,
        }

    return runs_dict


def collect_requested_traces(run: Run, requested_traces: dict, steps_num: int = 200) -> List[dict]:
    processed_traces_list = []
    for requested_trace in requested_traces:
        metric_name = requested_trace.get('metric_name')
        context = Context(requested_trace.get('context'))
        trace = run.get_trace(metric_name=metric_name, context=context)
        if not trace:
            continue

        iters, values = trace.values.sparse_list()

        num_records = len(values)
        step = (num_records // steps_num) or 1
        _slice = slice(0, num_records, step)

        processed_traces_list.append({
            'metric_name': trace.name,
            'context': trace.context.to_dict(),
            'values': values[_slice],
            'iters': iters[_slice],
        })

    return processed_traces_list


async def encoded_tree_streamer(encoded_runs_tree: Iterator[Tuple[bytes, bytes]]) -> bytes:
    for key, val in encoded_runs_tree:
        yield struct.pack('I', len(key)) + key + struct.pack('I', len(val)) + val