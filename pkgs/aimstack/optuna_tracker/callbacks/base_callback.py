import functools
from typing import Callable, Optional, Sequence, Union

import optuna
from optuna._experimental import experimental_class, experimental_func
from optuna._imports import try_import
from optuna.study.study import ObjectiveFuncType

with try_import() as _imports:
    from aimstack.experiment_tracker import TrainingRun


@experimental_class('2.9.0')
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
        metric_name (:obj:`str`, optional): Name assigned to optimized metric.
            In case of multi-objective optimization, list of names can be passed. Those names will be assigned
            to metrics in the order returned by objective function.
            If single name is provided, or this argument is left to default value,
            it will be broadcasted to each objective with a number suffix in order
            returned by objective function e.g. two objectives and default metric name
            will be logged as ``value_0`` and ``value_1``. The number of metrics must be
            the same as the number of values objective function returns.
        as_multirun (:obj:`bool`, optional): Creates new runs for each trial and sets the metrics as run parametrs.
            Useful for exploring parameters in Aim UI
            (for more: https://aimstack.readthedocs.io/en/latest/ui/pages/explorers.html#params-explorer).
            If is false then all of the stats are tracked in a single run as Aim metrics.
    """

    def __init__(
        self,
        repo: Optional[str] = None,
        experiment_name: Optional[str] = None,
        log_system_params: Optional[bool] = True,
        metric_name: Union[str, Sequence[str]] = 'value',
        as_multirun: bool = False,
    ) -> None:
        _imports.check()

        if not isinstance(metric_name, Sequence):
            raise TypeError(
                f'Expected metric_name to be string or sequence of strings, got {type(metric_name)}.'
            )

        self._metric_name = metric_name
        self._as_multirun = as_multirun
        self._repo_path = repo
        self._experiment_name = experiment_name
        self._log_system_params = log_system_params
        self._run = None
        self._run_hash = None

        if not self._as_multirun:
            self.setup()

    def __call__(
        self, study: optuna.study.Study, trial: optuna.trial.FrozenTrial
    ) -> None:
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

        self._run.set('study_name', study.study_name, strict=False)

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
    def experiment(self) -> TrainingRun:
        if self._run is not None:
            return self._run

    def setup(self, args=None):
        if not self._run:
            if self._run_hash:
                self._run = TrainingRun(self._run_hash, repo=self._repo_path)
            else:
                self._run = TrainingRun(repo=self._repo_path)
                self._run_hash = self._run.hash
                self._run['is_optuna_run'] = True
                if self._experiment_name is not None:
                    self._run.experiment = self._experiment_name
            if self._log_system_params:
                self._run.enable_system_monitoring()

        if args:
            for key, value in args.items():
                self._run.set(key, value, strict=False)

    def close(self) -> None:
        if self._run:
            self._run.close()
            del self._run
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
