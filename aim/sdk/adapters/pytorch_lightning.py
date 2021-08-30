from typing import Any, Dict, Optional, Union

from aim.sdk.run import Run
from aim.ext.resource.configs import DEFAULT_SYSTEM_TRACKING_INT


class AimLogger(object):
    __pl_logger_cls = None

    @staticmethod
    def __new__(cls, *args, **kwargs):
        pt_logger_inst = cls.__get_logger_cls()
        return pt_logger_inst(*args, **kwargs)

    @classmethod
    def __get_logger_cls(cls):
        if cls.__pl_logger_cls is not None:
            return cls.__pl_logger_cls

        from argparse import Namespace
        from pytorch_lightning.loggers.base import (
            LightningLoggerBase,
            rank_zero_experiment,
        )
        from pytorch_lightning.utilities import rank_zero_only

        class _PytorchLightningLogger(LightningLoggerBase):
            def __init__(self,
                         repo: Optional[str] = None,
                         experiment: Optional[str] = None,
                         train_metric_prefix: Optional[str] = 'train_',
                         val_metric_prefix: Optional[str] = 'val_',
                         test_metric_prefix: Optional[str] = 'test_',
                         system_tracking_interval: Optional[int]
                         = DEFAULT_SYSTEM_TRACKING_INT,
                         ):
                super().__init__()

                self._experiment_name = experiment
                self._repo_path = repo

                self._train_metric_prefix = train_metric_prefix
                self._val_metric_prefix = val_metric_prefix
                self._test_metric_prefix = test_metric_prefix
                self._system_tracking_interval = system_tracking_interval

                self._run = None

            @property
            @rank_zero_experiment
            def experiment(self) -> Run:
                if self._run is None:
                    self._run = Run(
                        repo=self._repo_path,
                        experiment=self._experiment_name,
                        system_tracking_interval=self._system_tracking_interval
                    )
                return self._run

            @rank_zero_only
            def log_hyperparams(self, params: Union[Dict[str, Any], Namespace]):
                params = self._convert_params(params)
                self.experiment['hparams'] = params

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
                    self.experiment.track(v, name=name, context=context)

            @rank_zero_only
            def close(self) -> None:
                super().close()

            @property
            def save_dir(self) -> str:
                return self.experiment.repo.path

            @property
            def name(self) -> str:
                return self._experiment_name

            @property
            def version(self) -> str:
                return self.experiment.hashname

        cls.__pl_logger_cls = _PytorchLightningLogger
        return cls.__pl_logger_cls

    def __init__(self,
                 repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 train_metric_prefix: Optional[str] = 'train_',
                 val_metric_prefix: Optional[str] = 'val_',
                 test_metric_prefix: Optional[str] = 'test_',
                 system_tracking_interval: Optional[int]
                 = DEFAULT_SYSTEM_TRACKING_INT,
                 ):
        pass
