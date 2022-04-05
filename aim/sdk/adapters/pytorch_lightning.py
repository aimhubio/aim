import os
from typing import Any, Dict, Optional, Union
from argparse import Namespace

try:
    from pytorch_lightning.loggers.base import (
        LightningLoggerBase,
        rank_zero_experiment,
    )
    from pytorch_lightning.utilities import rank_zero_only
except ImportError:
    raise RuntimeError(
        'This contrib module requires PyTorch Lightning to be installed. '
        'Please install it with command: \n pip install pytorch-lightning'
    )

from aim.sdk.run import Run
from aim.sdk.repo import Repo
from aim.sdk.utils import clean_repo_path, get_aim_repo_name
from aim.ext.resource.configs import DEFAULT_SYSTEM_TRACKING_INT


class AimLogger(LightningLoggerBase):
    def __init__(self,
                 repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 train_metric_prefix: Optional[str] = 'train_',
                 val_metric_prefix: Optional[str] = 'val_',
                 test_metric_prefix: Optional[str] = 'test_',
                 system_tracking_interval: Optional[int]
                 = DEFAULT_SYSTEM_TRACKING_INT,
                 log_system_params: bool = True,
                 ):
        super().__init__()

        self._experiment_name = experiment
        self._repo_path = repo

        self._train_metric_prefix = train_metric_prefix
        self._val_metric_prefix = val_metric_prefix
        self._test_metric_prefix = test_metric_prefix
        self._system_tracking_interval = system_tracking_interval
        self._log_system_params = log_system_params

        self._run = None
        self._run_hash = None

    @property
    @rank_zero_experiment
    def experiment(self) -> Run:
        if self._run is None:
            if self._run_hash:
                self._run = Run(
                    self._run_hash,
                    repo=self._repo_path,
                    system_tracking_interval=self._system_tracking_interval,
                )
            else:
                self._run = Run(
                    repo=self._repo_path,
                    experiment=self._experiment_name,
                    system_tracking_interval=self._system_tracking_interval,
                    log_system_params=self._log_system_params,
                )
                self._run_hash = self._run.hash
        return self._run

    @rank_zero_only
    def log_hyperparams(self, params: Union[Dict[str, Any], Namespace]):
        params = self._convert_params(params)

        # Handle OmegaConf object
        try:
            from omegaconf import OmegaConf
        except ModuleNotFoundError:
            pass
        else:
            # Convert to primitives
            if OmegaConf.is_config(params):
                params = OmegaConf.to_container(params, resolve=True)

        for key, value in params.items():
            self.experiment.set(('hparams', key), value, strict=False)

    @rank_zero_only
    def log_metrics(self, metrics: Dict[str, float],
                    step: Optional[int] = None):
        assert rank_zero_only.rank == 0, \
            'experiment tried to log from global_rank != 0'

        for k, v in metrics.items():
            name = k
            context = {}
            if self._train_metric_prefix \
                    and name.startswith(self._train_metric_prefix):
                name = name[len(self._train_metric_prefix):]
                context['subset'] = 'train'
            elif self._test_metric_prefix \
                    and name.startswith(self._test_metric_prefix):
                name = name[len(self._test_metric_prefix):]
                context['subset'] = 'test'
            elif self._val_metric_prefix \
                    and name.startswith(self._val_metric_prefix):
                name = name[len(self._val_metric_prefix):]
                context['subset'] = 'val'
            self.experiment.track(v, name=name, step=step, context=context)

    @rank_zero_only
    def close(self) -> None:
        super().close()
        if self._run:
            self._run.close()
            del self._run
            self._run = None

    def __del__(self):
        self.close()

    @property
    def save_dir(self) -> str:
        repo_path = clean_repo_path(self._repo_path) or Repo.default_repo_path()
        return os.path.join(repo_path, get_aim_repo_name())

    @property
    def name(self) -> str:
        return self._experiment_name

    @property
    def version(self) -> str:
        return self.experiment.hash
