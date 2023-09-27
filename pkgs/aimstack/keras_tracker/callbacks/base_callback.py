from typing import Optional

from aimstack.experiment_tracker import TrainingRun
from aimstack.keras_tracker.mixins import TrackerKerasCallbackMetricsEpochEndMixin

try:
    from keras.callbacks import Callback
except ImportError:
    raise RuntimeError(
        'This contrib module requires keras to be installed. '
        'Please install it with command: \n pip install keras'
    )


class BaseCallback(TrackerKerasCallbackMetricsEpochEndMixin, Callback):
    """
    BaseCallback callback class.

    Args:
        repo (:obj:`str`, optional): Aim repository path or Repo object to which TrainingRun object is bound.
            If skipped, default Repo is used.
        experiment_name (:obj:`str`, optional): Sets TrainingRun's `experiment` property. 'default' if not specified.
            Can be used later to query runs/sequences.
        log_system_params (:obj:`bool`, optional): Enable/Disable logging of system params such as installed packages,
            git info, environment variables, etc.
    """

    def __init__(
        self,
        repo: Optional[str] = None,
        experiment_name: Optional[str] = None,
        log_system_params: Optional[bool] = True,
    ):
        super(Callback, self).__init__()

        self._log_system_params = log_system_params

        self._run = TrainingRun(repo=repo)
        self._run['is_keras_run'] = True
        if experiment_name is not None:
            self._run.experiment = experiment_name
        if log_system_params:
            self._run.enable_system_monitoring()

        self._run_hash = self._run.hash
        self._repo_path = repo

    @property
    def experiment(self) -> TrainingRun:
        if not self._run:
            self._run = TrainingRun(self._run_hash, repo=self._repo_path)
            if self._log_system_params:
                self._run.enable_system_monitoring()
        return self._run

    @classmethod
    def metrics(
        cls,
        repo: Optional[str] = None,
        experiment: Optional[str] = None,
        run: Optional[TrainingRun] = None,
    ):
        # Keep `metrics` method for backward compatibility
        return cls(repo, experiment, run)

    def close(self) -> None:
        if self._run:
            self._run.close()
            del self._run
            self._run = None

    def __del__(self):
        self.close()
