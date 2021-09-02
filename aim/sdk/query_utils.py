from typing import Any, Union
from typing import TYPE_CHECKING

from aim.storage.proxy import AimObjectProxy
from aim.storage.structured.entities import StructuredObject
from aim.storage.treeview import TreeView
from aim.storage.types import AimObject, AimObjectKey, AimObjectPath

if TYPE_CHECKING:
    from aim.sdk.run import Run


class RunView:

    def __init__(self, run: 'Run'):
        self.db = run.repo.structured_db
        self.hashname = run.hashname
        self.structured_run_cls: type(StructuredObject) = self.db.run_cls()
        self.meta_run_tree: TreeView = run.meta_run_tree
        self.meta_run_attrs_tree: TreeView = run.meta_run_attrs_tree

    def __getattr__(self, item):
        if item in self.structured_run_cls.fields():
            return getattr(self.db.caches['runs_cache'][self.hashname], item)
        else:
            return self[item]

    def __getitem__(self, key):
        return AimObjectProxy(lambda: self.meta_run_attrs_tree.collect(key), view=self.meta_run_attrs_tree.view(key))

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


class MetricView:
    def __init__(self, name: str, context: dict, run_view: RunView):
        self.name = name
        self.run = run_view
        self._context = context

    @property
    def context(self):
        return AimObjectProxy(lambda: self._context, view=ContextView(self._context))
