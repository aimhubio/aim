from typing import Optional

from aim.sdk.run import Run
from aim.sdk.adapters.keras_mixins import TrackerKerasCallbackMetricsEpochEndMixin
from aim.ext.resource.configs import DEFAULT_SYSTEM_TRACKING_INT


class AimCallback(object):
    __kt_callback_cls = None

    @staticmethod
    def __new__(cls, *args, **kwargs):
        kt_callback_inst = cls.__get_callback_cls()
        return kt_callback_inst(*args, **kwargs)

    @classmethod
    def __get_callback_cls(cls):
        if cls.__kt_callback_cls is not None:
            return cls.__kt_callback_cls

        from kerastuner.engine.tuner_utils import TunerCallback

        class _KerasTunerCallback(TunerCallback):
            def __init__(self, tuner=None,
                         repo: Optional[str] = None,
                         experiment: Optional[str] = None,
                         system_tracking_interval: int = DEFAULT_SYSTEM_TRACKING_INT,
                         log_system_params: bool = True):
                self.tuner = tuner
                self._repo_path = repo
                self._experiment_name = experiment
                self._system_tracking_interval = system_tracking_interval
                self._log_system_params = log_system_params

                self._started_trials: List[str] = []
                self.trial = None
                self._run = None

            def on_epoch_begin(self, epoch, logs=None):
                trial_dict = self.tuner.oracle.ongoing_trials
                tuner_key = next(iter(trial_dict))
                self._current_trial_id = trial_dict[tuner_key].trial_id
                if not self._current_trial_id in self._started_trials:
                    if self._repo_path is None and self._experiment_name is None:
                        self._run = Run(system_tracking_interval=self._system_tracking_interval,
                                        log_system_params=self._log_system_params,)
                    else:
                        self._run = Run(repo=self._repo_path, experiment=self._experiment_name,
                                        system_tracking_interval=self._system_tracking_interval,
                                        log_system_params=self._log_system_params,)

                    self._run_hash = self._run.hash
                    self._started_trials.append(self._current_trial_id)
                trial = self.tuner.oracle.get_trial(self._current_trial_id)
                hparams = trial.hyperparameters.values
                for key in hparams:
                    self._run.set(key, hparams[key], strict=False)

            def on_batch_end(self, batch, logs=None):
                if logs:
                    context = {'trial_id': self._current_trial_id}
                    for log_name, log_value in logs.items():
                        self._run.track(log_value, name=log_name, context=context)

            def on_epoch_end(self, epoch, logs=None):
                pass

            def __del__(self):
                if self._run is not None and self._run.active:
                    self._run.close()

        cls.__kt_callback_cls = _KerasTunerCallback
        return cls.__kt_callback_cls

    def __init__(self, tuner=None,
                 repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 system_tracking_interval: int = DEFAULT_SYSTEM_TRACKING_INT,
                 log_system_params: bool = True):
        pass
