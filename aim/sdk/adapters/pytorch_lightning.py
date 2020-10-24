from typing import Any, Dict, Optional, Union

from aim.sdk.session.session import Session


class AimLogger(object):
    __pl_logger_cls = None

    @staticmethod
    def __new__(cls, *args, **kwargs):
        pt_logger_inst = cls.get_logger_cls()
        return pt_logger_inst(*args, **kwargs)

    @classmethod
    def get_logger_cls(cls):
        if cls.__pl_logger_cls is not None:
            return cls.__pl_logger_cls

        from argparse import Namespace
        from pytorch_lightning.loggers.base import (
            LightningLoggerBase,
            rank_zero_experiment,
        )
        from pytorch_lightning.utilities import rank_zero_only

        class _PytorchLightningLogger(LightningLoggerBase):
            def __init__(self, repo: Optional[str] = None,
                         experiment: Optional[str] = None):
                super().__init__()

                self._experiment_name = experiment
                self._repo_path = repo
                self._aim_session = None

            @property
            @rank_zero_experiment
            def experiment(self) -> Session:
                if self._aim_session is None:
                    self._aim_session = Session(
                        repo=self._repo_path,
                        experiment=self._experiment_name
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
                    if name.startswith('test_'):
                        name = name[5:]
                        context['subset'] = 'test'
                    elif name.startswith('valid_'):
                        name = name[6:]
                        context['subset'] = 'val'
                    elif name.startswith('train_'):
                        name = name[6:]
                        context['subset'] = 'train'
                    self.experiment.track(v, name=name, **context)

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

    def __init__(self, repo: Optional[str] = None,
                 experiment: Optional[str] = None):
        pass
