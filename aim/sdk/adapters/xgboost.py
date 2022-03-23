from typing import Optional

from aim.ext.resource.configs import DEFAULT_SYSTEM_TRACKING_INT
from aim.sdk.run import Run

try:
    from xgboost.callback import TrainingCallback
except ImportError:
    raise RuntimeError(
        'This contrib module requires XGBoost to be installed. '
        'Please install it with command: \n pip install xgboost'
    )


class AimCallback(TrainingCallback):

    def __init__(self, repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 system_tracking_interval: Optional[int]
                 = DEFAULT_SYSTEM_TRACKING_INT,
                 log_system_params: Optional[int] = True):
        super().__init__()
        self._repo = repo
        self._experiment = experiment
        self._system_tracking_interval = system_tracking_interval
        self._log_system_params = log_system_params
        self._initialized = False
        self._run = None

    @property
    def experiment(self) -> Run:
        return self._run

    def before_training(self, model):
        self._run = Run(
            repo=self._repo,
            experiment=self._experiment,
            system_tracking_interval=self._system_tracking_interval,
            log_system_params=self._log_system_params
        )
        self._initialized = True
        return model

    def after_training(self, model):
        if self._initialized and self._run:
            del self._run
            self._run = None
        return model

    def after_iteration(self, model, epoch: int, evals_log: TrainingCallback.EvalsLog) -> bool:
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

                self._run.track(score, step=0, name=metric_name, context={'stdv': False})
                if stdv is not None:
                    self._run.track(score, step=0, name=metric_name, context={'stdv': True})

        return False
