from typing import Optional

from aim import Run
from aim.ext.system_info import DEFAULT_SYSTEM_TRACKING_INT

try:
    from lightgbm.callback import CallbackEnv
except ImportError:
    raise RuntimeError(
        'This contrib module requires Lightgbm to be installed. '
        'Please install it with command: \n pip install lightgbm'
    )


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
    """

    def __init__(
        self,
        repo: Optional[str] = None,
        experiment_name: Optional[str] = None,
        system_tracking_interval: Optional[int] = DEFAULT_SYSTEM_TRACKING_INT,
        log_system_params: Optional[bool] = True,
        capture_terminal_logs: Optional[bool] = True,
    ):
        self._repo_path = repo
        self._experiment = experiment_name
        self._system_tracking_interval = system_tracking_interval
        self._log_system_params = log_system_params
        self._capture_terminal_logs = capture_terminal_logs
        self._run = None
        self._run_hash = None

        # callback parameters
        self.order = 25
        self.before_iteration = False

    @property
    def experiment(self) -> Run:
        if not self._run:
            self.setup()
        return self._run

    def setup(self):
        if self._run:
            return
        if self._run_hash:
            self._run = Run(
                self._run_hash,
                repo=self._repo_path,
                system_tracking_interval=self._system_tracking_interval,
                capture_terminal_logs=self._capture_terminal_logs,
            )
        else:
            self._run = Run(
                repo=self._repo_path,
                experiment=self._experiment,
                system_tracking_interval=self._system_tracking_interval,
                log_system_params=self._log_system_params,
                capture_terminal_logs=self._capture_terminal_logs,
            )
            self._run_hash = self._run.hash

    def __call__(self, env: CallbackEnv):
        if env.iteration == env.begin_iteration:
            self.setup()

        self.before_tracking(env=env)

        for item in env.evaluation_result_list:
            if len(item) == 4:
                data_name, eval_name, result, _ = item
                self._run.track(
                    result, name=eval_name, context={'data_name': data_name}
                )
            else:
                data_name, eval_name = item[1].split()
                res_mean = item[2]
                res_stdv = item[4]
                self._run.track(
                    res_mean, name=f'{eval_name}-mean', context={'data_name': data_name}
                )
                self._run.track(
                    res_stdv, name=f'{eval_name}-stdv', context={'data_name': data_name}
                )

        self.after_tracking(env=env)

    def close(self):
        if self._run:
            self._run.close()
            del self._run
            self._run = None

    def __del__(self):
        self.close()
