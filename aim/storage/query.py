import logging
from abc import abstractmethod
from typing import TYPE_CHECKING

from RestrictedPython import safe_builtins
from RestrictedPython import compile_restricted

from aim.storage.proxy import AimObjectProxy
if TYPE_CHECKING:
    from aim.storage.run import Run
    from aim.storage.context import Context


logger = logging.getLogger(__name__)


CODE_FORMAT = """
def check(
    run,
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
        namespace = dict()
        exec(self.byte_code, {'__builtins__': safe_builtins}, namespace)
        self._check = namespace['check']

    def match(
        self,
        run: 'Run',
        context: 'Context' = None,
        metric_name: str = None
    ) -> bool:

        run_tree_proxy = AimObjectProxy(lambda: run.meta_run_tree,
                                        run.meta_run_tree)

        context_proxy = AimObjectProxy(lambda: context.to_dict())

        # TODO enforce immutable
        try:
            return self._check(run=run_tree_proxy,
                               context=context_proxy,
                               metric_name=metric_name)
        except BaseException as e:
            logger.warning('query failed', e)
            return False
