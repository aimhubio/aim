import functools

from typing import Callable, Optional, Sequence, Union

import optuna

from optuna._experimental import experimental_class, experimental_func
from optuna._imports import try_import
from optuna.study.study import ObjectiveFuncType


with try_import() as _imports:
    from aim.ext.resource.configs import DEFAULT_SYSTEM_TRACKING_INT
    from aim.sdk.run import Run


@experimental_class('2.9.0')
class AimCallback:
    """Callback to track Optuna trials with Aim.

    This callback enables tracking of Optuna study in Aim.
    The study is tracked as a single experiment run,
    where all suggested hyperparameters and optimized metrics
    are logged and plotted as a function of optimizer steps.

    .. note::
        Users who want to run multiple Optuna studies within the same process
        should call ``close()`` method between subsequent calls to
        ``study.optimize()``. Calling ``close()`` method is not necessary
        if you are running one Optuna study per process.

    .. note::
        To ensure correct trial order in Aim, this callback
        should only be used with ``study.optimize(n_jobs=1)``.


    Args:
        metric_name:
            Name assigned to optimized metric. In case of multi-objective optimization,
            list of names can be passed. Those names will be assigned
            to metrics in the order returned by objective function.
            If single name is provided, or this argument is left to default value,
            it will be broadcasted to each objective with a number suffix in order
            returned by objective function e.g. two objectives and default metric name
            will be logged as ``value_0`` and ``value_1``. The number of metrics must be
            the same as the number of values objective function returns.
        as_multirun:
            Creates new runs for each trial and sets the metrics as run parameters.
            Useful for exploring parameters in Aim UI
            (for more: https://aimstack.readthedocs.io/en/latest/ui/pages/explorers.html#params-explorer).
            If is false then all of the stats are tracked in a single run as Aim metrics.

    """

    def __init__(
        self,
        metric_name: Union[str, Sequence[str]] = 'value',
        as_multirun: bool = False,
        repo: Optional[str] = None,
        experiment_name: Optional[str] = None,
        system_tracking_interval: Optional[int] = DEFAULT_SYSTEM_TRACKING_INT,
        log_system_params: Optional[bool] = True,
        capture_terminal_logs: Optional[bool] = True,
    ) -> None:
        _imports.check()

        if not isinstance(metric_name, Sequence):
            raise TypeError(f'Expected metric_name to be string or sequence of strings, got {type(metric_name)}.')

        self._metric_name = metric_name
        self._as_multirun = as_multirun
        self._repo_path = repo
        self._experiment_name = experiment_name
        self._system_tracking_interval = system_tracking_interval
        self._log_system_params = log_system_params
        self._capture_terminal_logs = capture_terminal_logs
        self._run = None
        self._run_hash = None

        if not self._as_multirun:
            self.setup()

    def __call__(self, study: optuna.study.Study, trial: optuna.trial.FrozenTrial) -> None:
        if isinstance(self._metric_name, str):
            if len(trial.values) > 1:
                # Broadcast default name for multi-objective optimization.
                names = [f'{self._metric_name}_{i}' for i in range(len(trial.values))]
            else:
                names = [self._metric_name]
        else:
            if len(self._metric_name) != len(trial.values):
                raise ValueError(
                    'Running multi-objective optimization '
                    f'with {len(trial.values)} objective values, but {len(self._metric_name)} names specified. '
                    'Match objective values and names, or use default broadcasting.'
                )
            else:
                names = self._metric_name

        metrics = {name: value for name, value in zip(names, trial.values)}

        if self._as_multirun:
            metrics['trial_number'] = trial.number

        attributes = {'direction': [d.name for d in study.directions]}

        step = trial.number if self._run else None

        if not self._run:
            self.setup()
            self._run.name = f'trial-{trial.number}'

        for key, value in attributes.items():
            self._run.set(('hparams', key), value, strict=False)

        self._run.set('study_name', study.study_name)

        if self._as_multirun:
            for key, value in trial.params.items():
                self._run.set(('hparams', key), value, strict=False)

            for key, value in metrics.items():
                self._run.set(key, value, strict=False)

            self.close()
        else:
            for key, value in trial.params.items():
                self._run.track(value, name=key, step=step)

            for key, value in metrics.items():
                self._run.track(value, name=key, step=step)

    @property
    def experiment(self) -> Run:
        if self._run is not None:
            return self._run

    def setup(self, args=None):
        if not self._run:
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
                    experiment=self._experiment_name,
                    system_tracking_interval=self._system_tracking_interval,
                    log_system_params=self._log_system_params,
                    capture_terminal_logs=self._capture_terminal_logs,
                )
                self._run_hash = self._run.hash

        if args:
            for key, value in args.items():
                self._run.set(key, value, strict=False)

    def close(self) -> None:
        if self._run:
            self._run.close()
            self._run = None
            self._run_hash = None

    @experimental_func('3.0.0')
    def track_in_aim(self) -> Callable:
        """Decorator for using Aim for tracking inside the objective function.

        All the metrics from inside the objective function will be logged into the same run
        which stores the parameters for a given trial.

        Returns:
            ObjectiveFuncType: Objective function with Aim tracking enabled.
        """

        def decorator(func: ObjectiveFuncType) -> ObjectiveFuncType:
            @functools.wraps(func)
            def wrapper(trial: optuna.trial.Trial) -> Union[float, Sequence[float]]:
                if not self._run:
                    self.setup()
                    self._run.name = f'trial-{trial.number}'
                return func(trial)

            return wrapper

        return decorator
