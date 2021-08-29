from typing import Optional

from aim.ext.resource.configs import DEFAULT_SYSTEM_TRACKING_INT
from aim.sdk.run import Run


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
                         = DEFAULT_SYSTEM_TRACKING_INT):
                super().__init__()
                self.repo = repo
                self.experiment = experiment
                self.system_tracking_interval = system_tracking_interval
                self.initialized = False
                self.aim_run = None

            def before_training(self, model):
                self.aim_run = Run(repo=self.repo,
                                   experiment=self.experiment,
                                   system_tracking_interval=self.system_tracking_interval)
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

                        self.aim_run.track(score, step=0, name=metric_name, context={'stdv': False})
                        if stdv is not None:
                            self.aim_run.track(score, step=0, name=metric_name, context={'stdv': True})

                return False

            def after_training(self, model):
                if self.initialized and self.aim_run:
                    del self.aim_run
                    self.aim_run = None
                return model

        cls.__xgboost_callback_cls = _XgboostCallback
        return cls.__xgboost_callback_cls

    def __init__(self, repo: Optional[str] = None, experiment: Optional[str] = None,
                 system_tracking_interval: Optional[int] = DEFAULT_SYSTEM_TRACKING_INT):
        pass
