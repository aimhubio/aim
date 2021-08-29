import logging

from time import time
from collections import Counter

from aim.sdk.errors import RepoIntegrityError
from aim.sdk.trace import RunTraceCollection
from aim.sdk.utils import generate_run_hash
from aim.sdk.num_utils import convert_to_py_number
from aim.sdk.types import AimObjectKey, AimObjectPath, AimObject

from aim.storage.hashing import hash_auto
from aim.storage.context import Context, Metric
from aim.storage.treeview import TreeView
from aim.storage.proxy import AimObjectProxy
from aim.storage.structured.entities import StructuredObject

from aim.ext.resource import ResourceTracker, DEFAULT_SYSTEM_TRACKING_INT

from typing import Any, Dict, Iterator, Optional, Tuple, Union
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from aim.sdk.trace import Trace
    from aim.sdk.trace import TraceCollection
    from aim.sdk.repo import Repo


logger = logging.getLogger(__name__)


class Run:

    _idx_to_ctx: Dict[int, Context] = dict()
    _props_cache_hint: str = None

    def __init__(self, hashname: Optional[str] = None, *,
                 repo: Optional[Union[str, 'Repo']] = None,
                 read_only: bool = False,
                 experiment: Optional[str] = None,
                 system_tracking_interval: int = DEFAULT_SYSTEM_TRACKING_INT):
        hashname = hashname or generate_run_hash()

        self._instance_creation_time = time()
        if repo is None:
            from aim.sdk.repo import Repo
            repo = Repo.default_repo()
        elif isinstance(repo, str):
            from aim.sdk.repo import Repo
            repo = Repo.from_path(repo)

        self.repo = repo
        self.read_only = read_only
        if not read_only:
            logger.debug(f'Opening Run {hashname} in write mode')

        self.hashname = hashname
        self._hash = None
        self._props = None

        self.contexts: Dict[Context, int] = dict()

        if experiment:
            self.props.experiment = experiment

        self.meta_tree: TreeView = self.repo.request(
            'meta', hashname, read_only=read_only, from_union=True
        ).tree().view('meta')
        self.meta_run_tree: TreeView = self.meta_tree.view('chunks').view(hashname)

        self.meta_attrs_tree: TreeView = self.meta_tree.view('attrs')
        self.meta_run_attrs_tree: TreeView = self.meta_run_tree.view('attrs')

        self.series_run_tree: TreeView = self.repo.request(
            'trcs', hashname, read_only=read_only
        ).tree().view('trcs').view('chunks').view(hashname)
        if not read_only:
            # TODO: [AT] check this once Container db open locking is added
            self.series_run_tree.preload()

        self.series_counters: Dict[Tuple[Context, str], int] = Counter()

        self._creation_time = None
        self._system_resource_tracker: ResourceTracker = None
        if not read_only:
            self.props
            self.creation_time
            self._prepare_resource_tracker(system_tracking_interval)

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
        self.contexts[ctx] = idx
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

    def _prepare_resource_tracker(self, tracking_interval: int):
        if tracking_interval and isinstance(tracking_interval, int) and tracking_interval > 0:
            try:
                self._system_resource_tracker = ResourceTracker(self.track, tracking_interval)
            except ValueError:
                print('To track system resource usage '
                      'please set `system_tracking_interval` greater than 0 '
                      'and less than 1 day')
            else:
                self._system_resource_tracker.start()

    def __delitem__(self, key: str):
        del self.meta_attrs_tree[key]
        del self.meta_run_attrs_tree[key]

    def track(
        self,
        value,
        name: str,
        step: int = None,
        epoch: int = None,
        *,
        context: AimObject = None,
    ):
        track_time = time()
        # TODO move to Trace
        if context is None:
            context = {}

        value = convert_to_py_number(value)

        ctx = Context(context)
        metric = Metric(name, ctx)

        if ctx not in self.contexts:
            self.meta_tree['contexts', ctx.idx] = ctx.to_dict()
            self.meta_run_tree['contexts', ctx.idx] = ctx.to_dict()
            self.contexts[ctx] = ctx.idx
            self._idx_to_ctx[ctx.idx] = ctx

        val_view = self.series_run_tree.view(metric.selector).array('val').allocate()
        epoch_view = self.series_run_tree.view(metric.selector).array('epoch').allocate()
        time_view = self.series_run_tree.view(metric.selector).array('time').allocate()

        max_idx = self.series_counters.get((ctx, name), None)
        if max_idx is None:
            max_idx = len(val_view)
        if max_idx == 0:
            self.meta_tree['traces', ctx.idx, name] = 1
        self.meta_run_tree['traces', ctx.idx, name, "last"] = value

        self.series_counters[ctx, name] = max_idx + 1

        # TODO perform assignments in an atomic way

        if step is None:
            step = max_idx
        val_view[step] = value
        epoch_view[step] = epoch
        time_view[step] = track_time

    @classmethod
    def set_props_cache_hint(cls, cache: str):
        cls._props_cache_hint = cache

    @property
    def props(self):
        if self._props is None:
            self._init_props()
        return self._props

    def _init_props(self):
        sdb = self.repo.structured_db
        if self._props_cache_hint:
            self._props = sdb.caches[self._props_cache_hint][self.hashname]
        else:
            self._props = sdb.find_run(self.hashname)
            if not self._props:
                if self.read_only:
                    raise RepoIntegrityError(f'Missing props for Run {self.hashname}')
                else:
                    self._props = sdb.create_run(self.hashname)
                    self._props.experiment = 'default'

    def proxy(self):
        run = RunView(self)
        return AimObjectProxy(lambda: run, view=run)

    def trace_tree(self, name: str, context: Context) -> TreeView:
        return self.series_run_tree.view((context.idx, name))

    def iter_all_traces(self) -> Iterator[Tuple[str, Context, 'Run']]:
        for ctx_idx, run_ctx_view in self.meta_run_tree.view('traces').items():
            assert isinstance(ctx_idx, int)
            ctx = self.idx_to_ctx(ctx_idx)
            # run_ctx_view = run_meta_traces.view(ctx_idx)
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
        from aim.sdk.trace import Trace
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

    def __del__(self):
        if self.read_only:
            return
        if self._system_resource_tracker:
            self._system_resource_tracker.stop()

        logger.warning(f'finalizing {self}')
        self.finalize()

    def finalize(self):
        index = self.repo._get_container('meta/index',
                                         read_only=False,
                                         from_union=False).view(b'')
        self.meta_run_tree.finalize(index=index)


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
        self.meta_run_attrs_tree: TreeView = run.meta_run_attrs_tree
        self.props_view = RunPropsView(run)

    def __getitem__(self, key):
        if key == 'props':
            return None
        else:
            return self.meta_run_attrs_tree.collect(key)

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
            path = (path,)

        if path[0] == 'props':
            return self.props_view
        else:
            return self.meta_run_attrs_tree.view(path)
