import logging
import datetime

from abc import abstractmethod
from collections import defaultdict
from typing import TYPE_CHECKING

from RestrictedPython import (
    safe_builtins,
    utility_builtins,
    limited_builtins,
    compile_restricted
)
from RestrictedPython.Eval import default_guarded_getitem
from RestrictedPython.Guards import (
    full_write_guard,
    guarded_iter_unpack_sequence,
    guarded_unpack_sequence
)

from aim.storage.proxy import AimObjectProxy
from aim.storage.run_metadata.entities import SafeNone

if TYPE_CHECKING:
    from aim.storage.repo import Repo
    from aim.storage.run import Run
    from aim.storage.context import Context


extra_builtins = {
    "datetime": datetime,
    "sorted": sorted,
    "min": min,
    "max": max,
    "sum": sum,
    "any": any,
    "all": all,
}

builtins = safe_builtins.copy()
builtins.update(utility_builtins)
builtins.update(limited_builtins)
builtins.update(extra_builtins)


def safer_getattr(object, name, default=None, getattr=getattr):
    """Getattr implementation which prevents using format on string objects.

    format() is considered harmful:
    http://lucumr.pocoo.org/2016/12/29/careful-with-str-format/

    """
    if name == 'format' and isinstance(object, str):
        raise NotImplementedError(
            'Using format() on a %s is not safe.' % object.__class__.__name__)
    if name.startswith('_'):
        raise AttributeError(
            '"{name}" is an invalid attribute name because it '
            'starts with "_"'.format(name=name)
        )
    return getattr(object, name, default)


builtins['_getattr_'] = safer_getattr


restricted_globals = {
    "__builtins__": builtins,
    "_write_": full_write_guard,
    "_getiter_": iter,
    "_getitem_": default_guarded_getitem,
    "_iter_unpack_sequence_": guarded_iter_unpack_sequence,
    "_unpack_sequence_": guarded_unpack_sequence
}

logger = logging.getLogger(__name__)


CODE_FORMAT = """
def check(
    run,
    run_ = None,
    context = None,
    metric_name = None
) -> bool:
    # Some aliases
    ctx = context
    metric = metric_name

    return bool({expr})
"""


class Query:
    def __init__(
        self,
        expr: str
    ):
        self.expr = expr

    @abstractmethod
    def match(
        self,
        run: 'Run',
        context: 'Context' = None,
        metric_name: str = None
    ) -> bool:
        ...

    def __call__(
        self,
        run: 'Run',
        context: 'Context' = None,
        metric_name: str = None
    ):
        return self.match(run=run,
                          context=context,
                          metric_name=metric_name)


class RunMetadataCache:
    def __init__(
            self,
            repo: 'Repo'
    ):
        self.repo = repo
        self.cache = None

    def __call__(self) -> dict:
        if self.cache is not None:
            return self.cache

        runs_factory = self.repo.run_metadata_db.runs()
        query_results = defaultdict(SafeNone)
        for run in runs_factory:
            query_results[run.hash] = run
        self.cache = query_results
        return query_results


class RestrictedPythonQuery(Query):

    def __init__(
        self,
        expr: str
    ):
        super().__init__(expr=expr)
        self.source_code = CODE_FORMAT.format(expr=self.expr)
        self.byte_code = compile_restricted(self.source_code,
                                            filename='<inline code>',
                                            mode='exec')
        self.run_metadata_cache = None
        namespace = dict()
        exec(self.byte_code, restricted_globals, namespace)
        self._check = namespace['check']

    def __bool__(
        self
    ) -> bool:
        return bool(self.expr)

    def match(
        self,
        run: 'Run',
        context: 'Context' = None,
        metric_name: str = None
    ) -> bool:

        run_tree_proxy = AimObjectProxy(lambda: run.meta_run_tree,
                                        run.meta_run_tree)

        if not self.run_metadata_cache:
            self.run_metadata_cache = RunMetadataCache(run.repo)  # to not overcomplicate things to pass repo to init
        run_sql_meta_proxy = AimObjectProxy(lambda: self.run_metadata_cache()[run.name])

        context_proxy = AimObjectProxy(lambda: context.to_dict())

        # TODO enforce immutable
        try:
            return self._check(run=run_tree_proxy,
                               run_=run_sql_meta_proxy,
                               context=context_proxy,
                               metric_name=metric_name)
        except BaseException as e:
            logger.warning('query failed', e)
            return False
