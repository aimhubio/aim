from typing import Optional, Union

from aim.sdk.run import BasicRun
from aim.ext.tensorboard_tracker.tracker import TensorboardTracker

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from aim.sdk.repo import Repo


class Run(BasicRun):
    def __init__(self, run_hash: Optional[str] = None, *,
                 sync_tensorboard_log_dir: str,
                 repo: Optional[Union[str, 'Repo']] = None,
                 experiment: Optional[str] = None):
        super().__init__(run_hash, repo=repo, read_only=False, experiment=experiment)
        self['tb_log_directory'] = sync_tensorboard_log_dir
        self._tensorboard_tracker = TensorboardTracker(self._tracker, sync_tensorboard_log_dir)
        self._tensorboard_tracker.start()
        self._resources.add_extra_resource(self._tensorboard_tracker)
