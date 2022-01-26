import struct

from typing import Iterable, Iterator, List, Tuple, Union, Optional
from typing import TYPE_CHECKING

from aim.web.api.runs.utils import IndexRange, get_run_props
from aim.sdk.uri_service import URIService, generate_resource_path
from aim.sdk.sequence_collection import SequenceCollection
from aim.sdk.sequence import Sequence

from aim.storage.treeutils import encode_tree
from aim.storage.context import Context

if TYPE_CHECKING:
    from aim.sdk.repo import Repo
    from aim.sdk.run import Run


def collect_streamable_data(encoded_tree: Iterator[Tuple[bytes, bytes]]) -> bytes:
    result = bytes()
    for key, val in encoded_tree:
        result += struct.pack('I', len(key)) + key + struct.pack('I', len(val)) + val
    return result


def get_blobs_batch(uri_batch: List[str], repo: 'Repo') -> Iterator[bytes]:
    uri_service = URIService(repo=repo)
    batch_iterator = uri_service.request_batch(uri_batch=uri_batch)
    for it in batch_iterator:
        yield collect_streamable_data(encode_tree(it))


class CustomObjectApi:
    def __init__(self, seq_type: str, resolve_blobs: bool):
        seq_cls = Sequence.registry.get(seq_type, None)
        if seq_cls is None:
            raise ValueError(f'\'{self.seq_type}\' is not a valid sequence type.')
        self.seq_type = seq_cls.sequence_name()
        self.resolve_blobs = resolve_blobs
        self.use_list = seq_cls.collections_allowed
        self.traces: SequenceCollection = None
        self.dump_fn = None
        self.trace_cache: dict = {}
        self.requested_traces: list = []
        self.record_range = None
        self.record_density = None
        self.total_record_range = None
        self.index_range = None
        self.index_density = None
        self.index_slice = None
        self.total_index_range = None

        if self.use_list:
            self._value_retriever = self.record_collection_retriever
        else:
            self._value_retriever = self.record_to_encodable

    def set_dump_data_fn(self, dump_fn: callable):
        self.dump_fn = dump_fn

    def set_trace_collection(self, traces: SequenceCollection):
        self.traces = traces

    def set_requested_traces(self, run: 'Run', requested_traces):
        for requested_trace in requested_traces:
            trace_name = requested_trace.name
            context = Context(requested_trace.context)
            trace = run._get_sequence(self.seq_type, trace_name, context)
            if not trace:
                continue
            self.requested_traces.append(trace)

    def set_ranges(self, calc_total_ranges: bool, record_range: IndexRange, record_density: int,
                   index_range: Optional[IndexRange] = None, index_density: Optional[int] = None):
        self.record_range = record_range
        self.record_density = record_density
        record_range_missing = self.record_range.start is None or self.record_range.stop is None

        if self.use_list:
            assert index_range is not None
            assert index_density is not None
            self.index_range = index_range
            self.index_density = index_density
            index_range_missing = self.index_range.start is None or self.index_range.stop is None
            if calc_total_ranges or record_range_missing or index_range_missing:
                self.total_record_range, self.total_index_range = self.calculate_trace_ranges()
        else:
            if calc_total_ranges or record_range_missing:
                self.total_record_range = self.calculate_trace_ranges()

        start = self.record_range.start if self.record_range.start is not None else self.total_record_range.start
        stop = self.record_range.stop if self.record_range.stop is not None else self.total_record_range.stop
        self.record_range = IndexRange(start, stop)
        if self.use_list:
            start = self.index_range.start if self.index_range.start is not None else self.total_index_range.start
            stop = self.index_range.stop if self.index_range.stop is not None else self.total_index_range.stop
            step = (stop - stop) // index_density or 1
            self.index_range = IndexRange(start, stop)
            self.index_slice = slice(self.index_range.start, self.index_range.stop, step)

    def get_trace_info(self, trace: Sequence, value_retriever: callable,
                       include_epochs: bool, include_timestamps: bool) -> dict:
        steps = []
        values = []
        steps_vals = trace.values.items_in_range(self.record_range.start, self.record_range.stop, self.record_density)

        for step, val in steps_vals:
            steps.append(step)
            values.append(value_retriever(step, val, trace))

        result = {
            'name': trace.name,
            'context': trace.context.to_dict(),
            'values': values,
            'iters': steps
        }
        if include_epochs:
            result['epochs'] = list(trace.epochs.values_in_range(
                self.record_range.start, self.record_range.stop, self.record_density
            ))
        if include_timestamps:
            result['timestamps'] = list(trace.timestamps.values_in_range(
                self.record_range.start, self.record_range.stop, self.record_density
            ))
        return result

    def record_to_encodable(self, step: int, record, trace: Sequence) -> Union[List[dict], dict]:
        rec_json = record.json()
        if self.resolve_blobs:
            rec_json['data'] = self.dump_fn(record)
        else:
            # TODO make path generation more abstract
            data_path = generate_resource_path(trace.values.tree.container, (step, 'data'))
            rec_json['blob_uri'] = URIService.generate_uri(trace.run.repo, trace.run.hash, 'seqs', data_path)
        return rec_json

    def record_collection_to_encodable(self, step: int, record_collection: Iterable, trace: Sequence) -> List[dict]:
        if not self.use_list:
            raise TypeError(f'Sequence \'{self.seq_type}\' does not support record collections.')
        result = []
        for idx, record in record_collection:
            rec_json = record.json()
            rec_json['index'] = idx
            if self.resolve_blobs:
                rec_json['data'] = record.data.load()
            else:
                # TODO make path generation more abstract
                data_path = generate_resource_path(trace.values.tree.container, (step, idx, 'data'))
                rec_json['blob_uri'] = URIService.generate_uri(trace.run.repo, trace.run.hash, 'seqs', data_path)
            result.append(rec_json)
        return result

    def record_collection_retriever(self, step, val, trace):
        assert self.use_list
        if isinstance(val, list):
            sliced_val = self.record_collection_slice(val, self.index_slice)
            return self.record_collection_to_encodable(step, sliced_val, trace)
        elif self.index_range.start == 0:
            res = self.record_to_encodable(step, val, trace)
            res['index'] = 0
            return [res]
        else:
            return []

    @staticmethod
    def record_collection_slice(values, _slice: slice) -> Iterable:
        yield from zip(range(_slice.start, _slice.stop, _slice.step), values[_slice])

    def _foreach_trace(self, callback: callable):
        if self.traces:
            for run_trace_collection in self.traces.iter_runs():
                run = run_trace_collection.run
                run_traces = []
                for trace in run_trace_collection.iter():
                    run_traces.append(trace)
                    callback(trace)
                if run_traces:
                    self.trace_cache[run.hash] = {
                        'run': run,
                        'traces': run_traces
                    }
        elif self.requested_traces:
            for trace in self.requested_traces:
                callback(trace)

    def calculate_trace_ranges(self) -> Union[IndexRange, Tuple[IndexRange, IndexRange]]:
        rec_start = None
        rec_stop = -1
        idx_start = 0  # record inner indexing is always sequential
        idx_stop = -1

        if self.use_list:
            def _update_ranges(trace: Sequence):
                nonlocal rec_start, rec_stop, idx_stop
                rec_start = min(trace.first_step(), rec_start) if rec_start else trace.first_step()
                rec_stop = max(trace.last_step(), rec_stop)
                idx_stop = max(trace.record_length() or 1, idx_stop)
        else:
            def _update_ranges(trace: Sequence):
                nonlocal rec_start, rec_stop, idx_stop
                rec_start = min(trace.first_step(), rec_start) if rec_start else trace.first_step()
                rec_stop = max(trace.last_step(), rec_stop)

        self._foreach_trace(_update_ranges)

        if self.use_list:
            return IndexRange(rec_start, rec_stop + 1), IndexRange(idx_start, idx_stop)
        else:
            return IndexRange(rec_start, rec_stop + 1)

    async def search_result_streamer(self):

        def _pack_run_data(run_: 'Run', traces_: list):
            rec_range = self.total_record_range if self.total_record_range else self.record_range
            idx_range = self.total_index_range if self.total_index_range else self.index_range
            ranges = {
                'record_range': [rec_range.start, rec_range.stop]
            }
            if self.use_list:
                ranges['index_range'] = [idx_range.start, idx_range.stop]
            run_dict = {
                run_.hash: {
                    'ranges': ranges,
                    'params': run_.get(...),
                    'traces': traces_,
                    'props': get_run_props(run_)
                }
            }
            return collect_streamable_data(encode_tree(run_dict))

        if self.trace_cache:
            for run_info in self.trace_cache.values():
                traces_list = []
                for trace in run_info['traces']:
                    traces_list.append(self.get_trace_info(trace, self._value_retriever, True, True))
                yield _pack_run_data(run_info['run'], traces_list)
        else:
            for run_trace_collection in self.traces.iter_runs():
                traces_list = []
                for trace in run_trace_collection.iter():
                    traces_list.append(self.get_trace_info(trace, self._value_retriever, True, True))
                if traces_list:
                    yield _pack_run_data(run_trace_collection.run, traces_list)

    async def requested_traces_streamer(self) -> List[dict]:
        rec_range = self.total_record_range if self.total_record_range else self.record_range
        if self.use_list:
            idx_range = self.total_index_range if self.total_index_range else self.index_range
        for trace in self.requested_traces:
            trace_dict = self.get_trace_info(trace, self._value_retriever, False, False)
            trace_dict['record_range'] = (rec_range.start, rec_range.stop)
            if self.use_list:
                trace_dict['index_range'] = (idx_range.start, idx_range.stop)
            yield collect_streamable_data(encode_tree(trace_dict))
