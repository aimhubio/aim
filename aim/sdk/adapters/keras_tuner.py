from typing import Optional

from aim.sdk.session.session import Session
from aim.engine.configs import DEFAULT_SYSTEM_TRACKING_INT
from aim.sdk.session.configs import DEFAULT_FLUSH_FREQUENCY


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
            def __init__(self,
                         tuner = None,
                         repo: Optional[str] = None,
                         experiment: Optional[str] = None,
                         system_tracking_interval: Optional[int]
                         = DEFAULT_SYSTEM_TRACKING_INT,
                         flush_frequency: Optional[int]
                         = DEFAULT_FLUSH_FREQUENCY):

                self._repo_path = repo
                self._system_tracking_interval = system_tracking_interval
                self._flush_frequency = flush_frequency
                self.tuner = tuner
                self.trial = None
                self._experiment_name = experiment
                self._started_trials = []
                self._aim_session = None

            def on_epoch_begin(self, epoch, logs=None):
                trial_dict = self.tuner.oracle.ongoing_trials
                tuner_key = next(iter(trial_dict))
                self._current_trial_id = trial_dict[tuner_key].trial_id
                if not self._current_trial_id in self._started_trials:
                    if self._aim_session is not None and self._aim_session.active:
                        self._aim_session.close()
                    self._aim_session = Session(
                        repo=self._repo_path,
                        experiment=self._experiment_name,
                        system_tracking_interval=self._system_tracking_interval,
                        flush_frequency=self._flush_frequency
                    )
                    self._started_trials.append(self._current_trial_id)
                trial = self.tuner.oracle.get_trial(self._current_trial_id)
                hparams = trial.hyperparameters.values
                self._aim_session.set_params(hparams, name='hparams')


            def on_batch_end(self, batch, logs=None):
                if logs:
                    context = {
                        'trial_id': self._current_trial_id
                    }
                    for log_name, log_value in logs.items():
                        self._aim_session.track(log_value, name=log_name, **context)

            def on_epoch_end(self, epoch, logs=None):
                self._aim_session.flush()

            def __del__(self):
                if self._aim_session is not None and self._aim_session.active:
                    self._aim_session.close()

        cls.__kt_callback_cls = _KerasTunerCallback
        return cls.__kt_callback_cls

    def __init__(self,
                 tuner = None,
                 repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 system_tracking_interval: Optional[int]
                 = DEFAULT_SYSTEM_TRACKING_INT,
                 flush_frequency: Optional[int]
                 = DEFAULT_FLUSH_FREQUENCY):
        pass
