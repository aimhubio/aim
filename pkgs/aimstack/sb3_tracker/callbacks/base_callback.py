import logging
from typing import Any, Dict, Optional, Tuple, Union

import numpy as np
from aimstack.experiment_tracker import TrainingRun
from stable_baselines3.common.callbacks import BaseCallback as Callback  # type: ignore
from stable_baselines3.common.logger import KVWriter, Logger

logger = logging.getLogger(__name__)


class OutputFormat(KVWriter):
    """
    Track key/value pairs into TrainingRun.
    """

    def __init__(self, aim_callback):
        self.aim_callback = aim_callback

    def write(
        self,
        key_values: Dict[str, Any],
        key_excluded: Dict[str, Union[str, Tuple[str, ...]]],
        step: int = 0,
    ) -> None:
        for (key, value), (_, excluded) in zip(
            sorted(key_values.items()), sorted(key_excluded.items())
        ):
            if excluded is not None:
                continue

            if isinstance(value, np.ScalarType):
                if not isinstance(value, str):
                    tag, key = key.split('/')
                    if tag in ['train', 'valid']:
                        context = {'subset': tag}
                    else:
                        context = {'tag': tag}

                    self.aim_callback.experiment.track(
                        value, key, step=step, context=context
                    )


class BaseCallback(Callback):
    """
    BaseCallback callback class.

    Args:
        repo (:obj:`str`, optional): Aim repository path or Repo object to which TrainingRun object is bound.
            If skipped, default Repo is used.
        experiment_name (:obj:`str`, optional): Sets TrainingRun's `experiment` property. 'default' if not specified.
            Can be used later to query runs/sequences.
        log_system_params (:obj:`bool`, optional): Enable/Disable logging of system params such as installed packages,
            git info, environment variables, etc.
        verbose (:obj:`bool`, optional): Enable/Disable verbose
    """

    def __init__(
        self,
        repo: Optional[str] = None,
        experiment_name: Optional[str] = None,
        log_system_params: Optional[bool] = True,
        verbose: int = 0,
    ) -> None:
        super().__init__(verbose)

        self.repo = repo
        self.experiment_name = experiment_name
        self.log_system_params = log_system_params
        self._run = None
        self._run_hash = None

    def _init_callback(self) -> None:
        args = {'algo': type(self.model).__name__}
        for key in self.model.__dict__:
            if type(self.model.__dict__[key]) in [float, int, str]:
                args[key] = self.model.__dict__[key]
            else:
                args[key] = str(self.model.__dict__[key])

        self.setup(args=args)

        loggers = Logger(
            folder=None,
            output_formats=[OutputFormat(self)],
        )

        self.model.set_logger(loggers)

    def _on_step(self) -> bool:
        return True

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
                self._run['is_sb3_run'] = True
                if self.experiment_name is not None:
                    self._run.experiment = self.experiment_name
            if self.log_system_params:
                self._run.enable_system_monitoring()

        # Log config parameters
        if args:
            for key in args:
                self._run.set(key, args[key], strict=False)

    def __del__(self):
        if self._run and self._run.active:
            self._run.close()
            del self._run
            self._run = None
