import asyncio
import time

from typing import TYPE_CHECKING, Iterable, Iterator, List, Optional, Tuple, Union

from aim.sdk.sequence import Sequence
from aim.sdk.sequence_collection import SequenceCollection
from aim.sdk.uri_service import URIService, generate_resource_path
from aim.storage.context import Context
from aim.storage.treeutils import encode_tree
from aim.web.api.runs.utils import (
    ASYNC_SLEEP_INTERVAL,
    PROGRESS_KEY_SUFFIX,
    IndexRange,
    collect_streamable_data,
    get_run_params,
    get_run_props,
)
from aim.web.configs import AIM_PROGRESS_REPORT_INTERVAL


if TYPE_CHECKING:
    from aim.sdk.repo import Repo
    from aim.sdk.run import Run


def get_blobs_batch(uri_batch: List[str], repo: 'Repo') -> Iterator[bytes]:
    uri_service = URIService(repo=repo)
    batch_iterator = uri_service.request_batch(uri_batch=uri_batch)
    for it in batch_iterator:
        yield collect_streamable_data(encode_tree(it))


class CustomObjectApi:
    def __init__(self, seq_type: str, resolve_blobs: bool):
        seq_cls = Sequence.registry.get(seq_type, None)
        if seq_cls is None:
            raise ValueError(f"'{self.seq_type}' is not a valid sequence type.")
        self.seq_type = seq_cls.sequence_name()
        self.resolve_blobs = resolve_blobs
        self.use_list = seq_cls.collections_allowed
        self.dump_fn = None

        self.traces: SequenceCollection = None
        self.requested_traces: list = []
        self.run: Run = None
        self.trace_cache: dict = {}

        self.record_range = None
        self.record_density = None
        self.total_record_range = None
        self.index_range = None
        self.index_density = None
        self.index_slice = None
        self.total_index_range = None

        if self.use_list:
            self._value_retriever = self._record_collection_retriever
        else:
            self._value_retriever = self._record_to_encodable

    def set_dump_data_fn(self, dump_fn: callable):
        self.dump_fn = dump_fn

    def set_trace_collection(self, traces: SequenceCollection):
        self.traces = traces

    def set_requested_traces(self, run: 'Run', requested_traces):
        self.run = run
        for requested_trace in requested_traces:
            trace_name = requested_trace.name
            context = Context(requested_trace.context)
            trace = run._get_sequence(self.seq_type, trace_name, context)
            if not trace:
                continue
            self.requested_traces.append(trace)

    def set_ranges(
        self,
        record_range: IndexRange,
        record_density: int,
        index_range: Optional[IndexRange] = None,
        index_density: Optional[int] = None,
        record_step: Optional[int] = None,
    ):
        self.record_range = record_range
        self.record_density = record_density

        if self.use_list:
            assert index_range is not None
            assert index_density is not None
            self.index_range = index_range
            self.index_density = index_density
            self.total_record_range, self.total_index_range = self._calculate_ranges()
        else:
            self.total_record_range = self._calculate_ranges()

        if record_step is not None:
            if record_step < 0:
                record_step += self.total_record_range.stop
            assert record_step < self.total_record_range.stop

            self.record_range = IndexRange(record_step, record_step + 1)

        self._adjust_ranges()
        if self.use_list:
            step = (self.index_range.stop - self.index_range.start) // index_density or 1
            self.index_slice = slice(self.index_range.start, self.index_range.stop, step)

    def get_total_record_range(self):
        return self._calculate_ranges()

    async def search_result_streamer(self, skip_system: bool, report_progress: bool):
        def _pack_run_data(run_: 'Run', traces_: list):
            ranges = {'record_range_used': self.record_range, 'record_range_total': self.total_record_range}
            if self.use_list:
                ranges['index_range_used'] = self.index_range
                ranges['index_range_total'] = self.total_index_range
            run_dict = {
                run_.hash: {
                    'ranges': ranges,
                    'params': get_run_params(run_, skip_system=skip_system),
                    'traces': traces_,
                    'props': get_run_props(run_),
                }
            }
            return collect_streamable_data(encode_tree(run_dict))

        try:
            last_reported_progress_time = time.time()
            run_info = None
            progress_reports_sent = 0
            for key in list(self.trace_cache.keys()):
                run_info = self.trace_cache[key]
                await asyncio.sleep(ASYNC_SLEEP_INTERVAL)
                if report_progress and time.time() - last_reported_progress_time > AIM_PROGRESS_REPORT_INTERVAL:
                    yield collect_streamable_data(
                        encode_tree({f'progress_{progress_reports_sent}_{PROGRESS_KEY_SUFFIX}': run_info['progress']})
                    )
                    yield collect_streamable_data(
                        encode_tree({f'progress_{progress_reports_sent}': run_info['progress']})
                    )
                    progress_reports_sent += 1
                    last_reported_progress_time = time.time()
                if run_info.get('traces') and run_info.get('run'):
                    traces_list = []
                    for trace in run_info['traces']:
                        traces_list.append(self._get_trace_info(trace, True, True))
                    yield _pack_run_data(run_info['run'], traces_list)
                    if report_progress:
                        yield collect_streamable_data(
                            encode_tree({f'progress_{progress_reports_sent}': run_info['progress']})
                        )
                        progress_reports_sent += 1
                        last_reported_progress_time = time.time()

                del self.trace_cache[key]
            self.traces = None
            if report_progress and run_info:
                yield collect_streamable_data(encode_tree({f'progress_{progress_reports_sent}': run_info['progress']}))
        except asyncio.CancelledError:
            pass

    async def requested_traces_streamer(self) -> List[dict]:
        try:
            for key in list(self.trace_cache.keys()):
                run_info = self.trace_cache[key]
                await asyncio.sleep(ASYNC_SLEEP_INTERVAL)
                for trace in run_info['traces']:
                    trace_dict = self._get_trace_info(trace, False, False)
                    trace_dict['record_range_used'] = self.record_range
                    trace_dict['record_range_total'] = self.total_record_range
                    if self.use_list:
                        trace_dict['index_range'] = self.index_range
                        trace_dict['index_range_total'] = self.total_index_range
                    yield collect_streamable_data(encode_tree(trace_dict))
                del self.trace_cache[key]
            self.run = None
        except asyncio.CancelledError:
            pass

    def _get_trace_info(self, trace: Sequence, include_epochs: bool, include_timestamps: bool) -> dict:
        steps = []
        values = []

        steps_vals = (
            trace.data.view('val').range(self.record_range.start, self.record_range.stop).sample(self.record_density)
        )

        for step, (val,) in steps_vals:
            steps.append(step)
            values.append(self._value_retriever(step, val, trace))

        result = {'name': trace.name, 'context': trace.context.to_dict(), 'values': values, 'iters': steps}
        if include_epochs:
            result['epochs'] = (
                trace.data.view('epoch')
                .range(self.record_range.start, self.record_range.stop)
                .sample(self.record_density)
                .values_list()
            )
        if include_timestamps:
            result['timestamps'] = (
                trace.data.view('time')
                .range(self.record_range.start, self.record_range.stop)
                .sample(self.record_density)
                .values_list()
            )
        return result

    def _record_to_encodable(self, step: int, record, trace: Sequence) -> dict:
        rec_json = record.json()
        if self.resolve_blobs:
            rec_json['data'] = self.dump_fn(record)
        else:
            # TODO make path generation more abstract
            data_path = generate_resource_path(trace.values.tree.container, (step, 'data'))
            rec_json['blob_uri'] = URIService.generate_uri(trace.run.repo, trace.run.hash, 'seqs', data_path)
        return rec_json

    def _record_collection_to_encodable(self, step: int, record_collection: Iterable, trace: Sequence) -> List[dict]:
        assert self.use_list, f"Sequence '{self.seq_type}' does not support record collections."
        result = []
        for idx, record in record_collection:
            rec_json = record.json()
            rec_json['index'] = idx
            if self.resolve_blobs:
                rec_json['data'] = self.dump_fn(record)
            else:
                # TODO make path generation more abstract
                data_path = generate_resource_path(trace.values.tree.container, (step, idx, 'data'))
                rec_json['blob_uri'] = URIService.generate_uri(trace.run.repo, trace.run.hash, 'seqs', data_path)
            result.append(rec_json)
        return result

    def _record_collection_retriever(self, step, val, trace):
        assert self.use_list
        if isinstance(val, list):
            sliced_val = self.record_collection_slice(val, self.index_slice)
            return self._record_collection_to_encodable(step, sliced_val, trace)
        elif self.index_range.start == 0:
            res = self._record_to_encodable(step, val, trace)
            res['index'] = 0
            return [res]
        else:
            return []

    @staticmethod
    def record_collection_slice(values, _slice: slice) -> Iterable:
        yield from zip(range(_slice.start, _slice.stop, _slice.step), values[_slice])

    def _foreach_trace(self, callback: callable):
        if self.traces:
            for run_trace_collection, progress in self.traces.iter_runs():
                if not run_trace_collection:
                    continue
                run = run_trace_collection.run
                self.trace_cache[run.hash] = {'progress': progress}
                run_traces = []
                for trace in run_trace_collection.iter():
                    run_traces.append(trace)
                    callback(trace)
                if run_traces:
                    self.trace_cache[run.hash].update({'run': run, 'traces': run_traces})
        elif self.requested_traces:
            for trace in self.requested_traces:
                callback(trace)
            assert self.run is not None
            self.trace_cache[self.run.hash] = {'run': self.run, 'traces': self.requested_traces}

    def _calculate_ranges(self) -> Union[IndexRange, Tuple[IndexRange, IndexRange]]:
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

    def _adjust_ranges(self):
        start = self.record_range.start if self.record_range.start is not None else self.total_record_range.start
        stop = self.record_range.stop if self.record_range.stop is not None else self.total_record_range.stop
        self.record_range = IndexRange(start, stop)
        if self.use_list:
            start = self.index_range.start if self.index_range.start is not None else self.total_index_range.start
            stop = self.index_range.stop if self.index_range.stop is not None else self.total_index_range.stop
            self.index_range = IndexRange(start, stop)
