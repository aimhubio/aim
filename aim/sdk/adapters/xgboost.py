from xgboost.callback import TrainingCallback, CallbackContainer
from aim.sdk.session.session import Session
from typing import Optional

class AimCallback(TrainingCallback):
    def __init__(self, repo: Optional[str] = None,
                 experiment: Optional[str] = None):
        super().__init__()
        self.repo = repo
        self.experiment = experiment
        self.initialized = False

    def before_training(self, model):
        self.aim_session = Session(
            repo=self.repo,
            experiment=self.experiment
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

                self.aim_session.track(score, name=metric_name, stdv=False)
                if stdv is not None:
                    self.aim_session.track(score, name=metric_name, stdv=True)

        return False

    def after_training(self, model):
        if self.initialized and self.aim_session.active:
            self.aim_session.close()
        return model

