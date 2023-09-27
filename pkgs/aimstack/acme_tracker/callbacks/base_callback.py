from typing import Dict, Optional

from acme.utils.loggers.base import Logger, LoggingData
from aimstack.experiment_tracker import TrainingRun


class BaseCallback:
    """
    BaseCallback callback class.

    Args:
        repo (:obj:`str`, optional): Aim repository path or Repo object to which TrainingRun object is bound.
            If skipped, default Repo is used.
        experiment_name (:obj:`str`, optional): Sets TrainingRun's `experiment` property. 'default' if not specified.
            Can be used later to query runs/sequences.
        log_system_params (:obj:`bool`, optional): Enable/Disable logging of system params such as installed packages,
            git info, environment variables, etc.
        args (:obj:`dict`, optional): Arguments to set a run parameters
    """

    def __init__(
        self,
        repo: Optional[str] = None,
        experiment_name: Optional[str] = None,
        log_system_params: Optional[bool] = True,
        args: Optional[Dict] = None,
    ):
        self.repo = repo
        self.experiment_name = experiment_name
        self.log_system_params = log_system_params
        self._run = None
        self._run_hash = None

        self.setup(args)

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
                self._run['is_acme_run'] = True
                if self.experiment_name is not None:
                    self._run.experiment = self.experiment_name
            if self.log_system_params:
                self._run.enable_system_monitoring()

        if args:
            for key, value in args.items():
                self._run.set(key, value, strict=False)

    def track(self, logs, step=None, context=None):
        for name, val in logs.items():
            self._run.track(val, name=name, step=step, context=context)

    def close(self):
        if self._run and self._run.active:
            self._run.close()
            del self._run
            self._run = None


class BaseWriter(Logger):
    def __init__(self, aim_run, logger_label, steps_key, task_id):
        self.aim_run = aim_run
        self.logger_label = logger_label
        self.steps_key = steps_key
        self.task_id = task_id

    def write(self, values: LoggingData):
        for name, value in values.items():
            self.aim_run.experiment.track(
                value, name=name, context={'logger_label': self.logger_label}
            )

    def close(self):
        if self.aim_run and self.aim_run.active:
            self.aim_run.close()
