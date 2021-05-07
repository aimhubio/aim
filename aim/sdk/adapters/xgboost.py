from typing import Optional

from aim.sdk.session.session import Session
from aim.engine.configs import DEFAULT_SYSTEM_TRACKING_INT
from aim.sdk.session.configs import DEFAULT_FLUSH_FREQUENCY


class AimCallback(object):
    __xgboost_callback_cls = None

    @staticmethod
    def __new__(cls, *args, **kwargs):
        xgboost_callback_inst = cls.__get_callback_cls()
        return xgboost_callback_inst(*args, **kwargs)

    @classmethod
    def __get_callback_cls(cls):
        if cls.__xgboost_callback_cls is not None:
            return cls.__xgboost_callback_cls
        
        from xgboost.callback import TrainingCallback, CallbackContainer

        class _XgboostCallback(TrainingCallback):
            def __init__(self, repo: Optional[str] = None,
                         experiment: Optional[str] = None,
                         system_tracking_interval: Optional[int]
                         = DEFAULT_SYSTEM_TRACKING_INT,
                         flush_frequency: Optional[int]
                         = DEFAULT_FLUSH_FREQUENCY):
                super().__init__()
                self.repo = repo
                self.experiment = experiment
                self.flush_frequency = flush_frequency
                self.system_tracking_interval = system_tracking_interval
                self.initialized = False
                self.aim_session = None

            def before_training(self, model):
                self.aim_session = Session(
                    repo=self.repo,
                    experiment=self.experiment,
                    flush_frequency=self.flush_frequency,
                    system_tracking_interval=self.system_tracking_interval
                )
                self.initialized = True
                return model

            def after_iteration(self, model, epoch: int,
                                evals_log: CallbackContainer.EvalsLog) -> bool:
                if not evals_log:
                    return False

                for data, metric in evals_log.items():
                    for metric_name, log in metric.items():
                        stdv: Optional[float] = None
                        if isinstance(log[-1], tuple):
                            score = log[-1][0]
                            stdv = log[-1][1]
                        else:
                            score = log[-1]

                        self.aim_session.track(score,
                                               name=metric_name,
                                               stdv=False)
                        if stdv is not None:
                            self.aim_session.track(score,
                                                   name=metric_name,
                                                   stdv=True)

                return False

            def after_training(self, model):
                if self.initialized and self.aim_session.active:
                    self.aim_session.close()
                return model

        cls.__xgboost_callback_cls = _XgboostCallback
        return cls.__xgboost_callback_cls
    
    def __init__(self,
                 repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 system_tracking_interval: Optional[int]
                 = DEFAULT_SYSTEM_TRACKING_INT,
                 flush_frequency: Optional[int] = DEFAULT_FLUSH_FREQUENCY):
        pass
