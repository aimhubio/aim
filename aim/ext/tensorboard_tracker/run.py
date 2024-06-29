from typing import TYPE_CHECKING, Optional, Union

from aim.ext.tensorboard_tracker.tracker import TensorboardTracker
from aim.sdk.run import Run as SdkRun


if TYPE_CHECKING:
    from aim.sdk.repo import Repo


class Run(SdkRun):
    def __init__(
        self,
        run_hash: Optional[str] = None,
        *,
        sync_tensorboard_log_dir: str,
        repo: Optional[Union[str, 'Repo']] = None,
        experiment: Optional[str] = None,
        force_resume: Optional[bool] = False,
        system_tracking_interval: Optional[Union[int, float]] = None,
        log_system_params: Optional[bool] = False,
        capture_terminal_logs: Optional[bool] = False,
    ):
        super().__init__(
            run_hash,
            repo=repo,
            read_only=False,
            experiment=experiment,
            force_resume=force_resume,
            system_tracking_interval=system_tracking_interval,
            log_system_params=log_system_params,
            capture_terminal_logs=capture_terminal_logs,
        )

        self['tb_log_directory'] = sync_tensorboard_log_dir
        self._tensorboard_tracker = TensorboardTracker(self._tracker, sync_tensorboard_log_dir)
        self._tensorboard_tracker.start()
        self._resources.add_extra_resource(self._tensorboard_tracker)
