import logging

from time import time

from collections import Counter

from aim.storage.types import AimObject
from aim.storage.sdk.trace import RunTraceCollection
from aim.storage.hashing import hash_auto
from aim.storage.context import Context, Metric
from aim.storage.treeview import TreeView
from aim.storage.containerview import ContainerView
from aim.storage.proxy import AimObjectProxy

from typing import Any, Dict, Iterator, Optional, Tuple
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from aim.storage.sdk.trace import Trace
    from aim.storage.sdk.trace import TraceCollection
    from aim.storage.sdk.repo import Repo


logger = logging.getLogger(__name__)


class Run:

    contexts: Dict[Context, int] = dict()
    _idx_to_ctx: Dict[int, Context] = dict()

    def __init__(self, hashname: str, *, repo: 'Repo' = None, read_only: bool = False):
        self._instance_creation_time = time()
        if repo is None:
            from aim.storage.sdk.repo import Repo
            repo = Repo.default_repo()

        self.repo = repo
        self.read_only = read_only
        if not read_only:
            logger.debug(f'Opening Run {hashname} in write mode')

        self.hashname = hashname

        self._hash = None

        self.meta_tree: TreeView = self.repo.request(
            'meta', hashname, read_only=read_only, from_union=True
        ).tree().view('meta')
        self.meta_run_tree: TreeView = self.meta_tree.view(['chunks', hashname])

        self.meta_attrs_tree: TreeView = self.meta_tree.view('attrs')
        self.meta_run_attrs_tree: TreeView = self.meta_run_tree.view('attrs')

        self.series_run_tree: TreeView = self.repo.request(
            'trcs', hashname, read_only=read_only
        ).tree().view('trcs').view(['chunks', hashname])

        self.series_counters: Dict[Tuple[Context, str], int] = Counter()

        self._creation_time = None
        if not read_only:
            self.creation_time()

    @property
    def creation_time(self):
        if self._creation_time is not None:
            return self._creation_time

        self._creation_time = self.meta_run_tree.get('creation_time', None)

        if self._creation_time is None:
            self._creation_time = self._instance_creation_time
            self.meta_run_tree['creation_time'] = self._creation_time

        return self._creation_time

    def __repr__(self) -> str:
        return f'<Run#{hash(self)} name={self.hashname} repo={self.repo}>'

    def idx_to_ctx(self, idx: int) -> Context:
        ctx = Run._idx_to_ctx.get(idx)
        if ctx is not None:
            return ctx
        ctx = Context(self.meta_tree['contexts', idx])
        Run._idx_to_ctx[idx] = ctx
        Run.contexts[ctx] = idx
        return ctx

    def __setitem__(self, key: str, val: Any):
        self.meta_run_attrs_tree[key] = val
        self.meta_attrs_tree[key] = val

    def __getitem__(self, key):
        return self._collect(key)

    def get(self, key, default: Any = None, strict: bool = True):
        try:
            return self._collect(key, strict=strict)
        except KeyError:
            return default

    def _collect(self, key, strict: bool = True):
        return self.meta_run_attrs_tree.collect(key, strict=strict)

    def __delitem__(self, key: str):
        del self.meta_attrs_tree[key]
        del self.meta_run_attrs_tree[key]

    def track(
        self,
        value,
        name: str,
        step: int,
        epoch: int = None,
        *,
        context: AimObject = None,
    ):
        time_view = self.series_run_tree.view(metric.selector).array('time').allocate()
        time_view[step] = time()

        # TODO move to Trace
        if context is None:
            context = {}

        ctx = Context(context)
        metric = Metric(name, ctx)

        if ctx not in self.contexts:
            self.meta_tree['contexts', ctx.idx] = ctx.to_dict()
            self.meta_run_tree['contexts', ctx.idx] = ctx.to_dict()
            self.contexts[ctx] = ctx.idx
            self._idx_to_ctx[ctx.idx] = ctx

        val_view = self.series_run_tree.view(metric.selector).array('val').allocate()
        epoch_view = self.series_run_tree.view(metric.selector).array('epoch').allocate()

        max_idx = self.series_counters.get((ctx, name), None)
        if max_idx == None:
            max_idx = len(val_view)
        if max_idx == 0:
            self.meta_tree['traces', ctx.idx, name] = {}
        self.meta_run_tree['traces', ctx.idx, name, "last"] = value

        self.series_counters[ctx, name] = max_idx + 1

        # TODO perform assignments in an atomic way

        val_view[step] = value
        epoch_view[step] = epoch

    def proxy(self):
        return AimObjectProxy(lambda: self.meta_run_attrs_tree, view=self.meta_run_attrs_tree)

    def trace_tree(self, name: str, context: Context) -> TreeView:
        return self.series_run_tree.view((context.idx, name))

    def iter_all_traces(self) -> Iterator[Tuple[str, Context, 'Run']]:
        run_meta_traces = self.meta_run_tree.view('traces')
        for ctx_idx in run_meta_traces.keys():
            assert isinstance(ctx_idx, int)
            ctx = self.idx_to_ctx(ctx_idx)
            run_ctx_view = run_meta_traces.view(ctx_idx)
            for metric_name in run_ctx_view.keys():
                assert isinstance(metric_name, str)
                yield metric_name, ctx, self

    def traces(self) -> 'TraceCollection':
        return RunTraceCollection(self)

    def __eq__(self, other: 'Run') -> bool:
        return self.hashname == other.hashname and self.repo == other.repo

    def get_trace(
            self,
            metric_name: str,
            context: Context
    ) -> Optional['Trace']:
        from aim.storage.sdk.trace import Trace
        trace = Trace(metric_name, context, self)
        return trace if bool(trace) else None

    def get_traces_overview(self) -> list:
        traces = self.meta_run_tree.view('traces')
        traces_overview = []
        for idx in traces.keys():
            ctx_dict = self.idx_to_ctx(idx).to_dict()
            for metric_name, value in traces[idx].items():
                traces_overview.append({
                    'context': ctx_dict,
                    'metric_name': metric_name,
                    'last_value': value
                })
        return traces_overview

    def _calc_hash(self) -> int:
        # TODO maybe take read_only flag into account?
        return hash_auto((self.hashname, hash(self.repo)))

    def __hash__(self) -> int:
        if self._hash is None:
            self._hash = self._calc_hash()
        return self._hash
