from typing import List, Optional

from aimstack.ml import Run

try:
    from kerastuner.engine.tuner_utils import TunerCallback
except ImportError:
    raise RuntimeError(
        "This contrib module requires KerasTuner to be installed. "
        "Please install it with command: \n pip install keras-tuner"
    )


class AimCallback(TunerCallback):
    """
    AimCallback callback class.

    Args:
        repo (:obj:`str`, optional): Aim repository path or Repo object to which Run object is bound.
            If skipped, default Repo is used.
        experiment_name (:obj:`str`, optional): Sets Run's `experiment` property. 'default' if not specified.
            Can be used later to query runs/sequences.
        log_system_params (:obj:`bool`, optional): Enable/Disable logging of system params such as installed packages,
            git info, environment variables, etc.
        tuner (:obj:`any`): keras_tuner instance
    """

    def __init__(
        self,
        repo: Optional[str] = None,
        experiment_name: Optional[str] = None,
        log_system_params: Optional[bool] = True,
        tuner=None,
    ):
        self._repo_path = repo
        self._experiment_name = experiment_name
        self._log_system_params = log_system_params

        self.tuner = tuner

        self._started_trials: List[str] = []
        self.trial = None
        self._run = None

    @property
    def experiment(self) -> Run:
        if self._run is not None:
            return self._run

    def on_epoch_begin(self, epoch, logs=None):
        trial_dict = self.tuner.oracle.ongoing_trials
        tuner_key = next(iter(trial_dict))
        self._current_trial_id = trial_dict[tuner_key].trial_id
        if self._current_trial_id not in self._started_trials:
            self._run = Run(repo=self._repo_path)
            if self._experiment_name is not None:
                self._run.experiment = self._experiment_name
            if self._log_system_params:
                self._run.enable_system_monitoring()
            self._run["trial_id"] = self._current_trial_id
            self._started_trials.append(self._current_trial_id)
        trial = self.tuner.oracle.get_trial(self._current_trial_id)
        hparams = trial.hyperparameters.values
        for key in hparams:
            self._run.set(key, hparams[key], strict=False)

    def on_batch_end(self, batch, logs=None):
        if logs:
            for log_name, log_value in logs.items():
                self._run.get_metric(name=log_name, context={}).track_auto(log_value)
