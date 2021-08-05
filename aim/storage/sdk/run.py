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

    def __init__(self, hashname: str, *, repo: "Repo" = None, read_only: bool = False):
        if repo is None:
            from aim.storage.sdk.repo import Repo
            repo = Repo.default_repo()

        self.repo = repo
        self.read_only = read_only
        if not read_only:
            logger.debug(f"Opening Run {hashname} in write mode")

        self.hashname = hashname

        self._hash = None
        self._props = None

        meta_container: ContainerView = self.repo.request(
            "meta", hashname, read_only=read_only, from_union=True
        ).view(b"meta\xfe")
        series_container: ContainerView = self.repo.request(
            "trcs", hashname, read_only=read_only
        ).view(b"trcs\xfe")

        self.meta_tree: TreeView = meta_container.tree().view("_")
        self.meta_run_tree: TreeView = meta_container.tree().view(hashname)
        self.series_run_tree: TreeView = series_container.tree().view(hashname)

        self.series_counters: Dict[Tuple[Context, str], int] = Counter()

    def __repr__(self) -> str:
        return f"<Run#{hash(self)} name={self.hashname} repo={self.repo}>"

    def idx_to_ctx(self, idx: int) -> Context:
        ctx = Run._idx_to_ctx.get(idx)
        if ctx is not None:
            return ctx
        ctx = Context(self.meta_tree["contexts", idx])
        Run._idx_to_ctx[idx] = ctx
        Run.contexts[ctx] = idx
        return ctx

    def __setitem__(self, key: str, val: Any):
        self.meta_run_tree[key] = val
        self.meta_tree[key] = val

    def __getitem__(self, key):
        return self._collect(key)

    def get(self, key, default: Any = None, strict: bool = True):
        try:
            return self._collect(key, strict=strict)
        except KeyError:
            return default

    def _collect(self, key, strict: bool = True):
        return self.meta_run_tree.collect(key, strict=strict)

    def __delitem__(self, key: str):
        del self.meta_tree[key]
        del self.meta_run_tree[key]

    def track(
        self,
        value,
        name: str,
        step: int,
        epoch: int = None,
        *,
        context: AimObject = None,
    ):
        # TODO move to Trace
        if context is None:
            context = {}

        ctx = Context(context)
        metric = Metric(name, ctx)

        if ctx not in self.contexts:
            self.meta_tree["contexts", ctx.idx] = ctx.to_dict()
            self.meta_run_tree["contexts", ctx.idx] = ctx.to_dict()
            self.contexts[ctx] = ctx.idx
            self._idx_to_ctx[ctx.idx] = ctx

        val_view = self.series_run_tree.view(metric.selector).array("val").allocate()
        epoch_view = self.series_run_tree.view(metric.selector).array("epoch").allocate()
        time_view = self.series_run_tree.view(metric.selector).array("time").allocate()

        max_idx = self.series_counters.get((ctx, name), None)
        if max_idx == None:
            max_idx = len(val_view)
        if max_idx == 0:
            self.meta_tree["traces", ctx.idx, name] = 1
            self.meta_run_tree["traces", ctx.idx, name] = 1
        self.series_counters[ctx, name] = max_idx + 1

        # TODO perform assignments in an atomic way

        val_view[step] = value
        epoch_view[step] = epoch
        time_view[step] = time()

    @property
    def props(self):
        if self._props is None:
            self._props = self.repo.structured_db.find_run(self.hashname)
        return self._props

    def proxy(self):
        run = RunView(self)
        return AimObjectProxy(lambda: run, view=run)

    def trace_tree(self, name: str, context: Context) -> TreeView:
        return self.series_run_tree.view((context.idx, name))

    def iter_all_traces(self) -> Iterator[Tuple[str, Context, "Run"]]:
        run_meta_traces = self.meta_run_tree.view("traces")
        for ctx_idx in run_meta_traces.keys():
            assert isinstance(ctx_idx, int)
            ctx = self.idx_to_ctx(ctx_idx)
            run_ctx_view = run_meta_traces.view(ctx_idx)
            for metric_name in run_ctx_view.keys():
                assert isinstance(metric_name, str)
                yield metric_name, ctx, self

    def traces(self) -> "TraceCollection":
        return RunTraceCollection(self)

    def __eq__(self, other: "Run") -> bool:
        return self.hashname == other.hashname and self.repo == other.repo

    def get_trace(
            self,
            metric_name: str,
            context: Context
    ) -> Optional['Trace']:
        from aim.storage.sdk.trace import Trace
        trace = Trace(metric_name, context, self)
        return trace if bool(trace) else None

    def get_params(self):
        return self.meta_run_tree['_attributes']

    def get_traces_overview(self) -> list:
        traces = self.meta_run_tree.collect('traces')
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

    # TODO: [MV] refer to real implementation later, hardcoded for now
    @property
    def started_at(self) -> float:
        from datetime import datetime
        created_time = datetime(2021, 1, 1, hour=0, minute=0, second=0)
        return created_time.timestamp()


from aim.storage.structured.entities import StructuredObject
from aim.storage.types import Union, AimObjectKey, AimObjectPath


class RunPropsView:
    def __init__(self, run: Run):
        self.meta_run_tree: TreeView = run.meta_run_tree
        self.hashname = run.hashname
        self.db = run.repo.structured_db
        self.structured_run_cls: type(StructuredObject) = self.db.run_cls()

    def view(self, path):
        if isinstance(path, (int, str)):
            path = [path]
        if path[0] in self.structured_run_cls.fields():
            return None
        else:
            return self.meta_run_tree.view(path)

    def __getitem__(self, item):
        if item in self.structured_run_cls.fields():
            return getattr(self.db.caches['runs_cache'][self.hashname], item)
        else:
            return self.meta_run_tree.collect(item)


class RunView:

    def __init__(self, run: Run):
        self.meta_run_tree: TreeView = run.meta_run_tree
        self.props_view = RunPropsView(run)

    def __getitem__(self, key):
        if key == 'props':
            return None
        else:
            return self.meta_run_tree.collect(key)

    def get(
        self,
        key,
        default: Any = None
    ) -> AimObject:
        try:
            return self.__getitem__(key)
        except KeyError:
            return default

    def view(self, path: Union[AimObjectKey, AimObjectPath]):
        if isinstance(path, (int, str)):
            path = [path]

        if path[0] == 'props':
            return self.props_view
        else:
            return self.meta_run_tree.view(path)
