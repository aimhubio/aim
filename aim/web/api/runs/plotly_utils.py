import json
from typing import Iterable, List
from typing import TYPE_CHECKING

from aim.storage.treeutils import encode_tree

from aim.storage.context import Context
from aim.sdk.objects import Plotly
from aim.sdk.run import Run
from aim.sdk.uri_service import URIService, generate_resource_path

from aim.web.api.runs.utils import collect_run_streamable_data, IndexRange
from aim.web.api.runs.pydantic_models import TraceBase

if TYPE_CHECKING:
    from aim.sdk import Repo


def preparer(obj: Plotly, trace, step, index=0):
    data = json.loads(obj.json())
    resource_path = generate_resource_path(trace.values.tree.container, (step, 'data'))
    data['blob_uri'] = URIService.generate_uri(trace.run.repo, trace.run.hash, 'seqs', resource_path)
    data['index'] = index
    return data


def collection_preparer(objs: Iterable[Plotly], trace, step):
    return [preparer(obj, trace, step, i) for i, obj in enumerate(objs)]


def plotly_batch_result_streamer(uri_batch: List[str], repo: 'Repo'):
    uri_service = URIService(repo=repo)
    batch_iterator = uri_service.request_batch(uri_batch=uri_batch)
    for it in batch_iterator:
        yield collect_run_streamable_data(encode_tree(it))


def requested_plotly_object_traces_streamer(run: Run,
                                            requested_traces: List[TraceBase],
                                            rec_range, idx_range,
                                            rec_num: int = 50, idx_num: int = 5) -> List[dict]:
    for requested_trace in requested_traces:
        trace_name = requested_trace.name
        context = Context(requested_trace.context)
        trace = run.get_plotly_sequence(name=trace_name, context=context)
        if not trace:
            continue

        record_range_missing = rec_range.start is None or rec_range.stop is None
        if record_range_missing:
            rec_range = IndexRange(trace.first_step(), trace.last_step() + 1)
        index_range_missing = idx_range.start is None or idx_range.stop is None
        if index_range_missing:
            idx_range = IndexRange(0, trace.record_length() or 1)

        rec_length = trace.record_length() or 1
        idx_step = rec_length // idx_num or 1
        idx_slice = slice(idx_range.start, idx_range.stop, idx_step)

        steps_vals = trace.values.items_in_range(rec_range.start, rec_range.stop, rec_num)
        steps = []
        values = []
        for step, val in steps_vals:
            steps.append(step)
            if isinstance(val, list):
                values.append(collection_preparer(val, trace, step))
            elif idx_slice.start == 0:
                values.append([preparer(val, trace, step)])
            else:
                values.append([])

        trace_dict = {
            'record_range': (trace.first_step(), trace.last_step() + 1),
            'index_range': (0, rec_length),
            'name': trace.name,
            'context': trace.context.to_dict(),
            'values': values,
            'iters': steps,
        }
        encoded_tree = encode_tree(trace_dict)
        yield collect_run_streamable_data(encoded_tree)
