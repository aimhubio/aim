import os
import logging
import datetime
import pytz

from typing import Union, Optional, TYPE_CHECKING

from aim.sdk.configs import AIM_RUN_INDEXING_TIMEOUT
from aim.sdk.base_run import BaseRun
from aim.ext.cleanup import AutoClean

if TYPE_CHECKING:
    from aim.sdk import Repo

logger = logging.getLogger(__name__)


class RunAutoClean(AutoClean['MaintenanceRun']):
    PRIORITY = 90

    def __init__(self, instance: 'MaintenanceRun') -> None:
        """
        Prepare the `Run` for automatic cleanup.

        Args:
            instance: The `Run` instance to be cleaned up.
        """
        super().__init__(instance)

        self.hash = instance.hash
        self.meta_run_tree = instance.meta_run_tree
        self.repo = instance.repo

    def _close(self) -> None:
        """
        Finalize the run by indexing all the data.
        """
        try:
            timeout = os.getenv(AIM_RUN_INDEXING_TIMEOUT, 2 * 60)
            index = self.repo._get_index_tree('meta', timeout=timeout).view(())
            logger.debug(f'Indexing Run {self.hash}...')
            self.meta_run_tree.finalize(index=index)
        except TimeoutError:
            logger.warning(f'Cannot index Run {self.hash}. Index is locked.')


class MaintenanceRun(BaseRun):
    def __init__(self, run_hash: str, repo: Optional[Union[str, 'Repo']] = None):
        self._resources: Optional[RunAutoClean] = None
        super().__init__(run_hash, repo=repo)
        self._resources = RunAutoClean(self)

    def set_finalization_time(self):
        self.meta_run_tree['end_time'] = datetime.datetime.now(pytz.utc).timestamp()
