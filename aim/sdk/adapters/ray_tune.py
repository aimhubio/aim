from typing import Optional, Dict

from ray.tune.experiment.trial import Trial
from ray.tune.logger import LoggerCallback
from ray.tune.result import TIMESTEPS_TOTAL, TRAINING_ITERATION

from aim.sdk.run import Run
from aim.ext.resource.configs import DEFAULT_SYSTEM_TRACKING_INT


class AimCallback(LoggerCallback):
    """
    AimCallback callback function.

    Args:
        repo (:obj:`str`, optional): Aim repository path or Repo object to which Run object is bound.
            If skipped, default Repo is used.
        experiment_name (:obj:`str`, optional): Sets Run's `experiment` property. 'default' if not specified.
            Can be used later to query runs/sequences.
        system_tracking_interval (:obj:`int`, optional): Sets the tracking interval in seconds for system usage
            metrics (CPU, Memory, etc.). Set to `None` to disable system metrics tracking.
        log_system_params (:obj:`bool`, optional): Enable/Disable logging of system params such as installed packages,
            git info, environment variables, etc.
        as_multirun:
            Creates new runs for each trial and sets the metrics as run parametrs.
            Useful for exploring parameters in Aim UI
            (for more: https://aimstack.readthedocs.io/en/latest/ui/pages/explorers.html#params-explorer).
            If is false then all of the stats are tracked in a single run as Aim metrics.
    """

    def __init__(
        self,
        repo: Optional[str] = None,
        experiment_name: Optional[str] = None,
        system_tracking_interval: Optional[int] = DEFAULT_SYSTEM_TRACKING_INT,
        log_system_params: bool = True,
        as_multirun: bool = False,
    ):
        self.as_multirun = as_multirun
        self.repo = repo
        self.experiment_name = experiment_name
        self.system_tracking_interval = system_tracking_interval
        self.log_system_params = log_system_params

    def setup(self, *args, **kwargs):
        if self.as_multirun:
            self._trial_runs: Dict[str, Run] = {}
        else:
            self._run = self._setup()

    def log_trial_start(self, trial: Trial):
        if self.as_multirun:
            if trial not in self._trial_runs:
                run = self._setup(run_name=f"trial-{str(trial)}", args=trial.config)
                self._trial_runs[trial] = run
        else:
            self._run.set(f"trial-{str(trial)}", trial.config, strict=False)

    def log_trial_result(self,
                         iteration: int,
                         trial: Trial,
                         result: Dict):

        step = result.get(TIMESTEPS_TOTAL) or result[TRAINING_ITERATION]
        result.pop('config')

        run = self._trial_runs[trial] if self.as_multirun else self._run
        context = {'subset': 'train'} if self.as_multirun else {'subset': 'train', 'trial': f"{str(trial)}"}

        self._track(run, result, context=context, step=step)

    def log_trial_end(self,
                      trial: Trial,
                      failed: bool = False):
        if self.as_multirun:
            run = self._trial_runs[trial]
            run.set('is_failed', failed)

            if run and run.active:
                run.close()
        else:
            self._run.set(f"trial-{str(trial)}", {**trial.config, 'is_failed': failed}, strict=False)

    def _track(self, run, logs, context, step=None):
        for k, v in logs.items():
            if v is not None and not isinstance(v, str):
                run.track(v, k, step=step, context=context)

    def _setup(self, run_name: str = None, args=None):
        run = Run(
            repo=self.repo,
            experiment=self.experiment_name,
            system_tracking_interval=self.system_tracking_interval,
            log_system_params=self.log_system_params,
        )

        if run_name:
            run.name = run_name

        # Log config parameters
        if args:
            for key in args:
                run.set(key, args[key], strict=False)

        return run

    def __del__(self):
        # might be unnecessary, just to make sure no run is left open
        if self.as_multirun:
            for trial_run in self._trial_runs.values():
                trial_run.close()
        else:
            self._run.close()
