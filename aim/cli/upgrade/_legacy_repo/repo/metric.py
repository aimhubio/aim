from typing import Optional, List

from aim.cli.upgrade._legacy_repo.repo.trace import Trace


class Metric(object):
    def __init__(self, repo, run, name: str, context: Optional[list] = None):
        self.repo = repo
        self.run = run
        self.name = name
        self.context = context
        self._traces = []  # type: List[Trace]
        self._tmp_all_traces = None  # type: Optional[List[Trace]]
        self._artifact_storage_opened = False

    def __repr__(self):
        return '<{}: {}>\n'.format(self.name, self.traces)

    def __hash__(self):
        return hash(self.name)

    def __eq__(self, other):
        return hash(self) == hash(other)

    def get_storage(self):
        return self.run.storage

    def open_artifact(self):
        if self._artifact_storage_opened is False:
            self._artifact_storage_opened = True
            self.get_storage().open(self.name, uncommitted_bucket_visible=True)

    def close_artifact(self):
        if self._artifact_storage_opened is True:
            self._artifact_storage_opened = False
            self.get_storage().close(self.name)

    def get_all_traces(self, ignore_empty_context=False) -> list:
        if self._tmp_all_traces:
            return self._tmp_all_traces
        traces = []
        if self.context is None:
            if not ignore_empty_context:
                # Get whole metric data if no context was provided
                traces.append(Trace(self.repo, self, self.name, None))
        else:
            for trace_context in self.context:
                trace = Trace(self.repo, self, self.name, trace_context)
                traces.append(trace)
        self._tmp_all_traces = traces
        return traces
