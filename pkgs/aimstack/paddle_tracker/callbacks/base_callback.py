from typing import Optional

from aimstack.experiment_tracker import TrainingRun
from paddle.hapi.callbacks import Callback


class BaseCallback(Callback):
    """
    BaseCallback callback function.

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
        self.repo = repo
        self.experiment_name = experiment_name
        self.log_system_params = log_system_params
        self._run = None
        self._run_hash = None

    def on_train_begin(self, logs=None):
        self.setup(self.params)

    def on_epoch_begin(self, epoch=None, logs=None):
        self.epoch = epoch

    def on_train_batch_end(self, step, logs=None):
        logs = logs or {}
        self._track(logs, {'subset': 'train'}, step)

    def on_eval_end(self, logs=None):
        self._track(logs, {'subset': 'valid'})

    def _track(self, logs, context, step=None):
        for k, v in logs.items():
            if isinstance(v, list):
                if len(v) == 1:
                    v = v[0]
                else:
                    raise NotImplementedError(f'number of items in {k} are more than 1')
            self._run.track(v, k, step=step, context=context, epoch=self.epoch)

    @property
    def experiment(self):
        if not self._run:
            self.setup()
        return self._run

    def setup(self, args=None):
        if not self._run:
            if self._run_hash:
                self._run = TrainingRun(self._run_hash, repo=self.repo)
            else:
                self._run = TrainingRun(repo=self.repo)
                self._run_hash = self._run.hash
                self._run['is_paddle_run'] = True
                if self.experiment_name is not None:
                    self._run.experiment = self.experiment_name
        if self.log_system_params:
            self._run.enable_system_monitoring()
        # Log config parameters
        if args:
            for key in args:
                self._run.set(key, args[key], strict=False)

    def __del__(self):
        if self._run is not None:
            self._run.close()
            del self._run
            self._run = None
