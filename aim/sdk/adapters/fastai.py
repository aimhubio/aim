from typing import Optional
from aim.sdk.session.session import Session

from aim.engine.configs import DEFAULT_SYSTEM_TRACKING_INT
from aim.sdk.session.configs import DEFAULT_FLUSH_FREQUENCY


class AimCallback(object):
    __fastai_callback_cls = None

    @staticmethod
    def __new__(cls, *args, **kwargs):
        fastai_callback_inst = cls.__get_callback_cls()
        return fastai_callback_inst(*args, **kwargs)

    @classmethod
    def __get_callback_cls(cls):
        if cls.__fastai_callback_cls is not None:
            return cls.__fastai_callback_cls

        from fastai.learner import Callback

        class _FastAICallback(Callback):
            def __init__(self,
                         repo: Optional[str] = None,
                         experiment: Optional[str] = None,
                         system_tracking_interval: Optional[int]
                         = DEFAULT_SYSTEM_TRACKING_INT,
                         flush_frequency: Optional[int]
                         = DEFAULT_FLUSH_FREQUENCY
                         ):
                self._repo_path = repo
                self._experiment_name = experiment
                self._system_tracking_interval = system_tracking_interval
                self._flush_frequency = flush_frequency
                self._initialized = False
                self._current_shift = None
                self._aim_session = None

            def before_fit(self):
                self._initialized = True

                self._aim_session = Session(
                    repo=self._repo_path,
                    experiment=self._experiment_name,
                    system_tracking_interval=self._system_tracking_interval,
                    flush_frequency=self._flush_frequency
                )
                # hparam_dict = self.learn.gather_args()
                # self._aim_session.set_params(hparam_dict, name='hparams')

            def after_batch(self):
                if self.training:
                    subset = 'train'
                else:
                    subset = 'val'
                context = {
                    'subset': subset,
                }

                self._aim_session.track(self.loss.item(), name='loss',
                                        **context)
                for metric in self.metrics:
                    self._aim_session.track(metric.value, name=metric.name,
                                            **context)

            def after_epoch(self):
                if self.training:
                    subset = 'train'
                else:
                    subset = 'val'
                context = {
                    'subset': subset,
                }
                metric_dict = zip(self.recorder.metric_names, self.recorder.log)
                for metric_name, val in metric_dict:
                    self._aim_session.track(val, name=metric_name, **context)

            def __del__(self):
                if self._initialized and self._aim_session.active:
                    self._aim_session.close()

        cls.__fastai_callback_cls = _FastAICallback
        return cls.__fastai_callback_cls

    def __init__(self,
                 repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 system_tracking_interval: Optional[int]
                 = DEFAULT_SYSTEM_TRACKING_INT,
                 flush_frequency: Optional[int] = DEFAULT_FLUSH_FREQUENCY
                 ):
        pass
