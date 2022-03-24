from typing import Optional

from aim.sdk.run import Run
from aim.sdk.adapters.keras_mixins import TrackerKerasCallbackMetricsEpochEndMixin
from aim.ext.resource.configs import DEFAULT_SYSTEM_TRACKING_INT

try:
    from tensorflow.keras.callbacks import Callback
except ImportError:
    raise RuntimeError(
        'This contrib module requires tensorflow to be installed. '
        'Please install it with command: \n pip install tensorflow'
    )


class AimCallback(TrackerKerasCallbackMetricsEpochEndMixin, Callback):
    def __init__(self, repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 system_tracking_interval: int = DEFAULT_SYSTEM_TRACKING_INT,
                 log_system_params: bool = True,):
        super(Callback, self).__init__()

        self._system_tracking_interval = system_tracking_interval
        self._log_system_params = log_system_params

        if repo is None and experiment is None:
            self._run = Run(system_tracking_interval=self._system_tracking_interval,
                            log_system_params=self._log_system_params,)
        else:
            self._run = Run(repo=repo, experiment=experiment,
                            system_tracking_interval=self._system_tracking_interval,
                            log_system_params=self._log_system_params,)

        self._run_hash = self._run.hash
        self._repo_path = repo

    @property
    def experiment(self) -> Run:
        if not self._run:
            self._run = Run(self._run_hash,
                            repo=self._repo_path,
                            system_tracking_interval=self._system_tracking_interval,)
        return self._run

    @classmethod
    def metrics(cls, repo: Optional[str] = None,
                experiment: Optional[str] = None,
                run: Optional[Run] = None):
        # Keep `metrics` method for backward compatibility
        return cls(repo, experiment, run)

    def close(self) -> None:
        if self._run:
            self._run.close()
            del self._run
            self._run = None

    def __del__(self):
        self.close()


# Keep `AimTracker` for backward compatibility
AimTracker = AimCallback
