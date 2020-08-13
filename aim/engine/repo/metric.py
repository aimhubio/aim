from typing import Optional, List

from aim.engine.repo.trace import Trace


class Metric(object):
    def __init__(self, repo, experiment_name: str, run_hash: str,
                 name: str, context: Optional[list] = None):
        self.repo = repo
        self.experiment_name = experiment_name
        self.run_hash = run_hash
        self.name = name
        self.context = context
        self._traces: List[Trace] = []

    def __repr__(self):
        return '<{}: {}>\n'.format(self.name, self.traces)

    def __hash__(self):
        return hash(self.name)

    def __eq__(self, other):
        return hash(self) == hash(other)

    @property
    def traces(self):
        return self._traces

    def append(self, trace: Trace):
        self._traces.append(trace)

    def get_all_traces(self):
        if self.context is None:
            return []
        traces = []
        for trace_context in self.context:
            trace = Trace(self.repo, self.experiment_name,
                          self.run_hash, trace_context)
            traces.append(trace)
        return traces
