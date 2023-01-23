from sys import stdout
from typing import Any, Dict, Optional, TypeVar

from aim import Run
from aim.ext.resource import DEFAULT_SYSTEM_TRACKING_INT


Prophet = TypeVar("Prophet")


class AimLogger:
    def __init__(
        self,
        prophet_model: Prophet,
        repo: Optional[str] = None,
        experiment: Optional[str] = None,
        system_tracking_interval: int = DEFAULT_SYSTEM_TRACKING_INT,
        log_system_params: bool = True,
        log_cout=stdout,
    ):
        """
        AimLogger for Prophet models.
        Prophet doesn't have a callback system and isn't trained iteratively.
        Thus, only the hyperparameters and user-provided metrics are logged.
        """
        self._repo_path = repo
        self._experiment = experiment
        self._system_tracking_interval = system_tracking_interval
        self._log_system_params = log_system_params
        self._run = None
        self._run_hash = None
        self._log_cout = log_cout
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
            )
        else:
            self._run = Run(
                repo=self._repo_path,
                experiment=self._experiment,
                system_tracking_interval=self._system_tracking_interval,
                log_system_params=self._log_system_params,
            )
            self._run_hash = self._run.hash

        for hparam, value in hparams.items():
            self._run.set(hparam, value, strict=False)

    def __del__(self) -> None:
        if self._run and self._run.active:
            self._run.close()

    def track_metrics(self, metrics: Dict[str, float]) -> None:
        """
        Since Prophet doesn't compute loss during training,
        only hyperparameters are logged by default.
        This method can be used to log any user-provied validation metrics.
        """
        for metric, value in metrics.items():
            self._run.track(value, name=metric, context={"subset": "val"})
