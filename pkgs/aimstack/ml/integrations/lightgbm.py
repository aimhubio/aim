from typing import Optional

from aimstack.ml import Run

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
        log_system_params (:obj:`bool`, optional): Enable/Disable logging of system params such as installed packages,
            git info, environment variables, etc.
    """

    def __init__(
        self,
        repo: Optional[str] = None,
        experiment_name: Optional[str] = None,
        log_system_params: Optional[bool] = True,
    ):
        self._repo_path = repo
        self._experiment = experiment_name
        self._log_system_params = log_system_params
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
            self._run = Run(self._run_hash, repo=self._repo_path)
        else:
            self._run = Run(repo=self._repo_path)
            self._run_hash = self._run.hash
            if self._experiment is not None:
                self._run.experiment = self._experiment
        if self._log_system_params:
            self._run.enable_system_monitoring()

    def __call__(self, env: CallbackEnv):
        if env.iteration == env.begin_iteration:
            self.setup()

        self.before_tracking(env=env)

        for item in env.evaluation_result_list:
            if len(item) == 4:
                data_name, eval_name, result, _ = item
                self._run.track_auto(
                    result, name=eval_name, context={'data_name': data_name}
                )
            else:
                data_name, eval_name = item[1].split()
                res_mean = item[2]
                res_stdv = item[4]
                self._run.track_auto(
                    res_mean, name=f'{eval_name}-mean', context={'data_name': data_name}
                )
                self._run.track_auto(
                    res_stdv, name=f'{eval_name}-stdv', context={'data_name': data_name}
                )

        self.after_tracking(env=env)

    def close(self):
        if self._run:
            del self._run
            self._run = None

    def __del__(self):
        self.close()
