import os
from weakref import WeakValueDictionary

from typing import Any, Dict, Generic, Iterator, List, TYPE_CHECKING, Tuple, TypeVar

from time import time

from collections import Counter

from aim.storage.containerview import ContainerView
from aim.storage.context import Context, Metric
from aim.storage.types import AimObject
from aim.storage.container import Container
from aim.storage.treeview import TreeView
from aim.storage.arrayview import ArrayView
from aim.storage.hashing import hash_auto
from aim.storage.trace import RunTraceCollection

if TYPE_CHECKING:
    from aim.storage.trace import Trace, TraceCollection
    from aim.storage.repo import Repo



class Run:

    contexts: Dict[Context, int] = dict()
    _idx_to_ctx: Dict[int, Context] = dict()

    def __init__(
        self,
        name: str,
        *,
        repo: 'Repo' = None,
        read_only: bool = False,
        from_union: bool = False
    ):
        if repo is None:
            from aim.storage.repo import Repo
            repo = Repo.default_repo()
        self.repo = repo
        self.read_only = read_only

        self.name = name

        self._hash = None

        self.from_union = from_union

        meta_container: ContainerView = self.repo.view(f'runs/{name}.meta', read_only=read_only, from_union=self.from_union)
        series_container: ContainerView = self.repo.view(f'runs/{name}.series', read_only=read_only)

        self.meta_tree: TreeView = meta_container.view(b'M\xfe').tree()
        self.meta_run_tree: TreeView = meta_container.view(b'M\xfe').tree().view([name])
        self.series_run_tree: TreeView = series_container.view(b'S\xfe').tree().view([name])

        self.series_counters: Dict[Tuple[Context, str], int] = Counter()

    @classmethod
    def from_repo(
        cls,
        repo: 'Repo'
    ) -> Iterator['Run']:
        for run_name in repo.runs_in_progress():
            yield Run(run_name, repo=repo, read_only=True)

    def __repr__(self) -> str:
        return f'<Run#{hash(self)} name={self.name} repo={self.repo}>'

    def idx_to_ctx(
        self,
        idx: int
    ) -> Context:
        ctx = Run._idx_to_ctx.get(idx)
        if ctx is not None:
            return ctx
        ctx = Context(self.meta_tree['contexts', idx])
        Run._idx_to_ctx[idx] = ctx
        Run.contexts[ctx] = idx
        return ctx

    def __setitem__(
        self,
        key: str,
        val: Any
    ):
        self.meta_run_tree[key] = val

    def __getitem__(
        self,
        key
    ):
        return self.meta_run_tree[key]

    def get(
        self,
        key
    ):
        try:
            return self[key]
        except KeyError:
            return None

    def __delitem__(
        self,
        key: str
    ):
        del self.meta_run_tree[key]

    def track(
        self,
        value,
        name: str,
        iter: int = None,
        epoch: int = None,
        *,
        context: AimObject = None
    ):
        # TODO move to Trace
        if context is None:
            context = {}

        ctx = Context(context)
        metric = Metric(name, ctx)

        if ctx not in self.contexts:
            self.meta_tree['contexts', ctx.idx] = ctx.to_dict()
            self.contexts[ctx] = ctx.idx
            self._idx_to_ctx[ctx.idx] = ctx

        val_view = self.series_run_tree.view(metric.selector).array('val').allocate()
        iter_view = self.series_run_tree.view(metric.selector).array('iter').allocate()
        epoch_view = self.series_run_tree.view(metric.selector).array('epoch').allocate()
        time_view = self.series_run_tree.view(metric.selector).array('time').allocate()

        step = self.series_counters.get((name, ctx), None)
        if step == None:
            step = len(iter_view)
        if step == 0:
            self.meta_run_tree['traces', ctx.idx, name] = 1
        self.series_counters[name, ctx] = step + 1

        val_view[step] = value
        iter_view[step] = iter
        epoch_view[step] = epoch
        time_view[step] = time()

    def trace_tree(
        self,
        name: str,
        context: Context
    ) -> TreeView:
        return self.series_run_tree.view((context.idx, name))

    def iter_all_traces(
        self
    ) -> Iterator[Tuple[str, Context, 'Run']]:
        # for ctx_idx in self.series_run_tree.keys():
        #     for metric_name in self.series_run_tree[ctx_idx].keys():
        #         ctx = self.idx_to_ctx(ctx_idx)
        #         yield metric_name, ctx, self
        run_meta_traces = self.meta_tree.view((self.name, 'traces'))
        for ctx_idx in run_meta_traces.keys():
            ctx = self.idx_to_ctx(ctx_idx)
            run_ctx_view = run_meta_traces.view((ctx_idx,))
            for metric_name in run_ctx_view.keys():
                # run_ctx_metric_view = run_ctx_view.view((metric_name,))
                yield metric_name, ctx, self

        # for (ctx_idx, metric_name), val in self.series_run_tree.iterlevel(level=2):

        #     yield metric_name, ctx, self

    def traces(
        self
    ) -> 'TraceCollection':
        return RunTraceCollection(self)

    def __eq__(
        self,
        other: 'Run'
    ) -> bool:
        return (self.name == other.name and
                self.repo == other.repo)

    def _calc_hash(
        self
    ) -> int:
        # TODO maybe take read_only flag into account?
        return hash_auto((self.name, hash(self.repo)))

    def __hash__(
        self
    ) -> int:
        if self._hash is None:
            self._hash = self._calc_hash()
        return self._hash
