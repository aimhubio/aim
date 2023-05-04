from typing import Optional, Dict
from aim.sdk.run import Run
from aim.ext.resource.configs import DEFAULT_SYSTEM_TRACKING_INT
from acme.utils.loggers.base import Logger, LoggingData


class AimCallback:
    """
    AimCallback callback class.

    Args:
        repo (:obj:`str`, optional): Aim repository path or Repo object to which Run object is bound.
            If skipped, default Repo is used.
        experiment_name (:obj:`str`, optional): Sets Run's `experiment` property. 'default' if not specified.
            Can be used later to query runs/sequences.
        system_tracking_interval (:obj:`int`, optional): Sets the tracking interval in seconds for system usage
            metrics (CPU, Memory, etc.). Set to `None` to disable system metrics tracking.
        log_system_params (:obj:`bool`, optional): Enable/Disable logging of system params such as installed packages,
            git info, environment variables, etc.
        capture_terminal_logs (:obj:`bool`, optional): Enable/Disable terminal stdout logging.
        args (:obj:`dict`, optional): Arguments to set a run parameters
    """

    def __init__(
        self,
        repo: Optional[str] = None,
        experiment_name: Optional[str] = None,
        system_tracking_interval: Optional[int] = DEFAULT_SYSTEM_TRACKING_INT,
        log_system_params: Optional[bool] = True,
        capture_terminal_logs: Optional[bool] = True,
        args: Optional[Dict] = None,
    ):
        self.repo = repo
        self.experiment_name = experiment_name
        self.system_tracking_interval = system_tracking_interval
        self.log_system_params = log_system_params
        self.capture_terminal_logs = capture_terminal_logs
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
                self._run = Run(
                    self._run_hash,
                    repo=self.repo,
                    system_tracking_interval=self.system_tracking_interval,
                    log_system_params=self.log_system_params,
                    capture_terminal_logs=self.capture_terminal_logs,
                )
            else:
                self._run = Run(
                    repo=self.repo,
                    experiment=self.experiment_name,
                    system_tracking_interval=self.system_tracking_interval,
                    log_system_params=self.log_system_params,
                    capture_terminal_logs=self.capture_terminal_logs,
                )
                self._run_hash = self._run.hash

        if args:
            for key, value in args.items():
                self._run.set(key, value, strict=False)

    def track(self, logs, step=None, context=None):
        self._run.track(logs, step=step, context=context)

    def close(self):
        if self._run and self._run.active:
            self._run.close()


class AimWriter(Logger):
    def __init__(self, aim_run, logger_label, steps_key, task_id):
        self.aim_run = aim_run
        self.logger_label = logger_label
        self.steps_key = steps_key
        self.task_id = task_id

    def write(self, values: LoggingData):
        self.aim_run.track(values, context={'logger_label': self.logger_label})

    def close(self):
        if self.aim_run and self.aim_run.active:
            self.aim_run.close()
