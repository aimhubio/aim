from typing import Any, Dict, Optional, Union

from aim.sdk.session.session import Session
from aim.engine.utils import convert_to_py_number
from aim.sdk.session.configs import DEFAULT_FLUSH_FREQUENCY


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
                         flush_frequency: int = DEFAULT_FLUSH_FREQUENCY,
                         ):
                super().__init__()

                self._experiment_name = experiment
                self._repo_path = repo

                self._train_metric_prefix = train_metric_prefix
                self._val_metric_prefix = val_metric_prefix
                self._test_metric_prefix = test_metric_prefix
                self._flush_frequency = flush_frequency

                self._aim_session = None

            @property
            @rank_zero_experiment
            def experiment(self) -> Session:
                if self._aim_session is None:
                    self._aim_session = Session(
                        repo=self._repo_path,
                        experiment=self._experiment_name,
                        flush_frequency=self._flush_frequency,
                    )
                return self._aim_session

            @rank_zero_only
            def log_hyperparams(self, params: Union[Dict[str, Any], Namespace]):
                params = self._convert_params(params)
                self.experiment.set_params(params, name='hparams')

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
                    self.experiment.track(convert_to_py_number(v),
                                          name=name,
                                          **context)

            @rank_zero_only
            def close(self) -> None:
                super().close()
                self.experiment.close()

            @property
            def save_dir(self) -> str:
                return self.experiment.repo_path

            @property
            def name(self) -> str:
                return self._experiment_name

            @property
            def version(self) -> str:
                return self.experiment.run_hash

        cls.__pl_logger_cls = _PytorchLightningLogger
        return cls.__pl_logger_cls

    def __init__(self,
                 repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 train_metric_prefix: Optional[str] = 'train_',
                 val_metric_prefix: Optional[str] = 'val_',
                 test_metric_prefix: Optional[str] = 'test_',
                 flush_frequency: int = DEFAULT_FLUSH_FREQUENCY,
                 ):
        pass
