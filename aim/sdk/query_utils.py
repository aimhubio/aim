import datetime

from typing import Any, Union
from typing import TYPE_CHECKING

from aim.storage.proxy import AimObjectProxy
from aim.storage.structured.entities import StructuredObject
from aim.storage.treeview import TreeView
from aim.storage.types import AimObject, AimObjectKey, AimObjectPath, SafeNone
from aim.storage.structured.sql_engine.entities import ModelMappedRun

if TYPE_CHECKING:
    from aim.sdk.run import Run


class RunView:

    def __init__(self, run: 'Run', runs_proxy_cache: dict = None):
        self.db = run.repo.structured_db
        self.hash = run.hash
        self.structured_run_cls: type(StructuredObject) = ModelMappedRun
        self.meta_run_tree: TreeView = run.meta_run_tree
        self.meta_run_attrs_tree: TreeView = run.meta_run_attrs_tree
        self.run = run
        self.proxy_cache = None
        if runs_proxy_cache is not None:
            if runs_proxy_cache.get(run.hash) is None:
                runs_proxy_cache[run.hash] = {}
            self.proxy_cache = runs_proxy_cache[run.hash]

    def __getattr__(self, item):
        if item in ['finalized_at', 'end_time']:
            end_time = self.meta_run_tree['end_time']
            if item == 'finalized_at':
                return datetime.datetime.fromtimestamp(end_time) if end_time else None
            else:
                return end_time
        if item == 'active':
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

        return AimObjectProxy(safe_collect, view=self.meta_run_attrs_tree.subtree(key),
                              cache=self.proxy_cache)

    def get(
        self,
        key,
        default: Any = None
    ) -> AimObject:
        try:
            return self.__getitem__(key)
        except KeyError:
            return default


class ContextView:
    def __init__(self, context: dict):
        self.context = context

    def __getitem__(self, key):
        return self.context[key]

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

        return ContextView(self.context[path[0]])


class SequenceView:
    def __init__(self, name: str, context: dict, run_view: RunView):
        self.name = name
        self.run = run_view
        self._context = context

    @property
    def context(self):
        return AimObjectProxy(lambda: self._context, view=ContextView(self._context))
