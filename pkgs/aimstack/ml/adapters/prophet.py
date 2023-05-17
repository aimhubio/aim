from typing import Any, Dict, Optional, TypeVar

from aim import Run
from aim.ext.system_info import DEFAULT_SYSTEM_TRACKING_INT
from aim.core.storage.types import AimObject

Prophet = TypeVar('Prophet')


class AimLogger:
    """
    AimLogger logger class.

    Prophet doesn't have a callback system and isn't trained iteratively.
    Thus, only the hyperparameters and user-provided metrics are logged.

    Args:
        repo (:obj:`str`, optional): Aim repository path or Repo object to which Run object is bound.
            If skipped, default Repo is used.
        experiment_name (:obj:`str`, optional): Sets Run's `experiment` property. 'default' if not specified.
            Can be used later to query runs/sequences.
        system_tracking_interval (:obj:`int`, optional): Sets the tracking interval in seconds for system usage
            metrics (CPU, Memory, etc.). Set to `None` to disable system metrics tracking.
        log_system_params (:obj:`bool`, optional): Enable/Disable logging of system params such as installed packages,
            git info, environment variables, etc.
        capture_terminal_logs (:obj:`bool`, optional): Enable/Disable terminal stdout logging.
        prophet_model (:obj: `Any`, optional): An instance of Prophet model.
    """

    def __init__(
        self,
        repo: Optional[str] = None,
        experiment_name: Optional[str] = None,
        system_tracking_interval: Optional[int] = DEFAULT_SYSTEM_TRACKING_INT,
        log_system_params: Optional[bool] = True,
        capture_terminal_logs: Optional[bool] = True,
        prophet_model: Prophet = None,
    ):
        self._repo_path = repo
        self._experiment = experiment_name
        self._system_tracking_interval = system_tracking_interval
        self._log_system_params = log_system_params
        self._capture_terminal_logs = capture_terminal_logs
        self._run = None
        self._run_hash = None
        self.setup(prophet_model.__dict__)

    @property
    def experiment(self) -> Run:
        if not self._run:
            self.setup()
        return self._run

    def setup(self, hparams: Dict[str, Any]) -> None:
        """
        Sets up a Run and logs hyperparameters (this method is only used in the constructor).
        """
        if self._run:
            return
        if self._run_hash:
            self._run = Run(
                self._run_hash,
                repo=self._repo_path,
                system_tracking_interval=self._system_tracking_interval,
                capture_terminal_logs=self._capture_terminal_logs,
            )
        else:
            self._run = Run(
                repo=self._repo_path,
                experiment=self._experiment,
                system_tracking_interval=self._system_tracking_interval,
                log_system_params=self._log_system_params,
                capture_terminal_logs=self._capture_terminal_logs,
            )
            self._run_hash = self._run.hash

        for hparam, value in hparams.items():
            self._run.set(hparam, value, strict=False)

    def __del__(self) -> None:
        if self._run and self._run.active:
            self._run.close()

    def track_metrics(
        self,
        metrics: Dict[str, float],
        context: AimObject = None,
    ) -> None:
        """
        Since Prophet doesn't compute loss during training,
        only hyperparameters are logged by default.
        This method can be used to log any user-provied metrics.
        NOTE: if context is not provided, it's assumed all metrics are validation metrics.
        """
        if context is None:
            context = {'subset': 'val'}
        for metric, value in metrics.items():
            self._run.track(value, name=metric, context=context)
