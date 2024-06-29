import datetime

from typing import TYPE_CHECKING, Any, Union

import pytz

from aim.storage.context import Context
from aim.storage.proxy import AimObjectProxy
from aim.storage.structured.entities import StructuredObject
from aim.storage.structured.sql_engine.entities import ModelMappedRun
from aim.storage.treeview import TreeView
from aim.storage.types import AimObject, AimObjectKey, AimObjectPath, SafeNone


if TYPE_CHECKING:
    from aim.sdk.run import Run


class RunView:
    def __init__(self, run: 'Run', runs_proxy_cache: dict = None, timezone_offset: int = 0):
        self.db = run.repo.structured_db
        self.hash = run.hash
        self.structured_run_cls: type(StructuredObject) = ModelMappedRun
        self.meta_run_tree: TreeView = run.meta_run_tree
        self.meta_run_attrs_tree: TreeView = run.meta_run_attrs_tree
        self.run = run
        self.proxy_cache = None
        self._timezone_offset = timezone_offset
        if runs_proxy_cache is not None:
            if runs_proxy_cache.get(run.hash) is None:
                runs_proxy_cache[run.hash] = {}
            self.proxy_cache = runs_proxy_cache[run.hash]

    def __getattr__(self, item):
        if item == 'metrics':
            return MetricsView(self.meta_run_tree, self.proxy_cache)
        if item in ['finalized_at', 'end_time']:
            end_time = self.meta_run_tree['end_time']
            if item == 'finalized_at':
                if not end_time:
                    return None
                else:
                    return datetime.datetime.fromtimestamp(end_time, tz=pytz.utc).replace(
                        tzinfo=None
                    ) - datetime.timedelta(minutes=self._timezone_offset)
            else:
                return end_time
        if item == 'created_at':
            return getattr(self.db.caches['runs_cache'][self.hash], item) - datetime.timedelta(
                minutes=self._timezone_offset
            )
        if item in ('active', 'duration'):
            return getattr(self.run, item)
        elif item in self.structured_run_cls.fields():
            if self.db:
                return getattr(self.db.caches['runs_cache'][self.hash], item)
            else:
                return getattr(self.run, item)
        else:
            return self[item]

    def __getitem__(self, key):
        def safe_collect():
            res = None
            if self.proxy_cache is not None:
                res = self.proxy_cache.get(key)
            if not res:
                try:
                    res = self.meta_run_attrs_tree.collect(key)
                except Exception:
                    res = SafeNone()
                if self.proxy_cache is not None:
                    self.proxy_cache[key] = res
            return res

        return AimObjectProxy(safe_collect, view=self.meta_run_attrs_tree.subtree(key), cache=self.proxy_cache)

    def get(self, key, default: Any = None) -> AimObject:
        try:
            return self.__getitem__(key)
        except KeyError:
            return default


class MetricsView:
    def __init__(self, meta_run_tree, proxy_cache):
        self.meta_run_tree = meta_run_tree
        self.proxy_cache = proxy_cache

    def __getitem__(self, item):
        def safe_collect():
            res = None
            if self.proxy_cache is not None:
                res = self.proxy_cache.get(key)
            if not res:
                try:
                    res = self.meta_run_attrs_tree.collect(key)
                except Exception:
                    res = SafeNone()
                if self.proxy_cache is not None:
                    self.proxy_cache[key] = res
            return res

        if isinstance(item, str):
            metric_name = item
            context_idx = Context({}).idx
        elif isinstance(item, tuple):
            if len(item) > 2:
                return SafeNone()
            metric_name, context = item
            if not isinstance(metric_name, str):
                return SafeNone()
            if isinstance(context, int):
                context_idx = context
            elif isinstance(context, dict):
                context_idx = Context(context).idx
            else:
                return SafeNone()
        else:
            return SafeNone()

        key = ('traces', context_idx, metric_name)
        return AimObjectProxy(safe_collect, view=self.meta_run_tree.subtree(key), cache=self.proxy_cache)

    def __getattr__(self, item):
        raise NotImplementedError


class ContextView:
    def __init__(self, context: dict):
        self.context = context

    def __getitem__(self, key):
        return self.context[key]

    def get(self, key, default: Any = None) -> AimObject:
        try:
            return self.__getitem__(key)
        except KeyError:
            return default

    def view(self, path: Union[AimObjectKey, AimObjectPath]):
        if isinstance(path, (int, str)):
            path = (path,)

        return ContextView(self.context[path[0]])


class SequenceView:
    def __init__(self, name: str, context: dict, run_view: RunView):
        self.name = name
        self.run = run_view
        self._context = context
        self._sequence_meta_tree = None

    @property
    def context(self):
        return AimObjectProxy(lambda: self._context, view=ContextView(self._context))

    def __getattr__(self, item):
        def safe_collect():
            try:
                return self._sequence_meta_tree.collect(item)
            except Exception:
                return SafeNone()

        if not self._sequence_meta_tree:
            self._sequence_meta_tree = self.run.meta_run_tree.subtree(('traces', Context(self._context).idx, self.name))

        return AimObjectProxy(safe_collect, view=self._sequence_meta_tree.subtree(item))
