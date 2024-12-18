import importlib.util
import os
import warnings

from argparse import Namespace
from typing import Any, Dict, Optional, Union

import packaging.version


if importlib.util.find_spec('lightning'):
    import lightning.pytorch as pl

    from lightning.pytorch.loggers.logger import Logger, rank_zero_experiment
    from lightning.pytorch.utilities import rank_zero_only
elif importlib.util.find_spec('pytorch_lightning'):
    import pytorch_lightning as pl

    if packaging.version.parse(pl.__version__) < packaging.version.parse('1.7'):
        from pytorch_lightning.loggers.base import (
            LightningLoggerBase as Logger,
        )
        from pytorch_lightning.loggers.base import (
            rank_zero_experiment,
        )
    else:
        from pytorch_lightning.loggers.logger import (
            Logger,
            rank_zero_experiment,
        )

    from pytorch_lightning.utilities import rank_zero_only
else:
    raise RuntimeError(
        'This contrib module requires PyTorch Lightning to be installed. '
        'Please install it with command: \n pip install pytorch-lightning'
        'or \n pip install lightning'
    )

from aim.ext.resource.configs import DEFAULT_SYSTEM_TRACKING_INT
from aim.sdk.repo import Repo
from aim.sdk.run import Run
from aim.sdk.utils import clean_repo_path, get_aim_repo_name


class AimLogger(Logger):
    def __init__(
        self,
        repo: Optional[str] = None,
        experiment: Optional[str] = None,
        train_metric_prefix: Optional[str] = 'train_',  # deprecated
        val_metric_prefix: Optional[str] = 'val_',  # deprecated
        test_metric_prefix: Optional[str] = 'test_',  # deprecated
        system_tracking_interval: Optional[int] = DEFAULT_SYSTEM_TRACKING_INT,
        log_system_params: Optional[bool] = True,
        capture_terminal_logs: Optional[bool] = True,
        run_name: Optional[str] = None,
        run_hash: Optional[str] = None,
        context_prefixes: Optional[Dict] = None,
        context_postfixes: Optional[Dict] = None,
    ):
        super().__init__()

        self._experiment_name = experiment
        self._run_name = run_name
        self._repo_path = repo

        CONTEXT_PREFIXES_DEFAULT = dict(subset={'train': 'train_', 'val': 'val_', 'test': 'test_'})
        if context_prefixes is None:
            context_prefixes = CONTEXT_PREFIXES_DEFAULT
        if context_postfixes is None:
            context_postfixes = {}

        # Handle deprecated SUBSET_metric_prefix arguments
        if context_prefixes == CONTEXT_PREFIXES_DEFAULT:
            # only use deprecated SUBSET_metric_prefixes if context_prefixes is default
            context_prefixes['subset']['train'] = train_metric_prefix
            context_prefixes['subset']['val'] = val_metric_prefix
            context_prefixes['subset']['test'] = test_metric_prefix
            # setting a legacy subset_metric_prefixes to None or '' will remove it from context_prefixes
            if not train_metric_prefix:
                context_prefixes['subset'].pop('train')
            if not val_metric_prefix:
                context_prefixes['subset'].pop('val')
            if not test_metric_prefix:
                context_prefixes['subset'].pop('test')
            # if all subset values were removed, remove the subset
            if not context_prefixes['subset']:
                context_prefixes.pop('subset')
                # context_prefixes is now empty {}
        elif train_metric_prefix != 'train_' or val_metric_prefix != 'val_' or test_metric_prefix != 'test_':
            raise ValueError(
                'Arguments "train_metric_prefix" "val_metric_prefix" "train_metric_prefix" cannot be used in conjunction with "context_prefixes".'
            )
        # Deprecation warnings if SUBSET_metric_prefix arguments are not default
        if train_metric_prefix != 'train_':
            msg = 'The argument "train_metric_prefix" is deprecated. Consider using "context_prefixes" instead.'
            warnings.warn(msg, category=DeprecationWarning, stacklevel=2)
        if val_metric_prefix != 'val_':
            msg = 'The argument "val_metric_prefix" is deprecated. Consider using "context_prefixes" instead.'
            warnings.warn(msg, category=DeprecationWarning, stacklevel=2)
        if test_metric_prefix != 'test_':
            msg = 'The argument "test_metric_prefix" is deprecated. Consider using "context_prefixes" instead.'
            warnings.warn(msg, category=DeprecationWarning, stacklevel=2)

        self._context_prefixes = context_prefixes
        self._context_postfixes = context_postfixes
        self._system_tracking_interval = system_tracking_interval
        self._log_system_params = log_system_params
        self._capture_terminal_logs = capture_terminal_logs

        self._run = None
        self._run_hash = run_hash

    @staticmethod
    def _convert_params(params: Union[Dict[str, Any], Namespace]) -> Dict[str, Any]:
        # in case converting from namespace
        if isinstance(params, Namespace):
            params = vars(params)

        if params is None:
            params = {}

        return params

    @property
    @rank_zero_experiment
    def experiment(self) -> Run:
        if self._run is None:
            if self._run_hash:
                self._run = Run(
                    self._run_hash,
                    repo=self._repo_path,
                    system_tracking_interval=self._system_tracking_interval,
                    capture_terminal_logs=self._capture_terminal_logs,
                    force_resume=True,
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
            if self._run_name is not None:
                self._run.name = self._run_name
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
    def log_metrics(self, metrics: Dict[str, float], step: Optional[int] = None):
        assert rank_zero_only.rank == 0, 'experiment tried to log from global_rank != 0'

        metric_items: Dict[str:Any] = {k: v for k, v in metrics.items()}
        epoch: int = metric_items.pop('epoch', None)

        for k, v in metric_items.items():
            name, context = self.parse_context(k)
            self.experiment.track(v, name=name, step=step, epoch=epoch, context=context)

    def parse_context(self, name):
        context = {}

        for ctx, mappings in self._context_prefixes.items():
            for category, prefix in mappings.items():
                if name.startswith(prefix):
                    name = name[len(prefix) :]
                    context[ctx] = category
                    break  # avoid prefix rename cascade

        for ctx, mappings in self._context_postfixes.items():
            for category, postfix in mappings.items():
                if name.endswith(postfix):
                    name = name[: -len(postfix)]
                    context[ctx] = category
                    break  # avoid postfix rename cascade

        return name, context

    @rank_zero_only
    def finalize(self, status: str = '') -> None:
        super().finalize(status)
        if self._run:
            self._run.close()
            del self._run
            self._run = None

    def __del__(self):
        self.finalize()

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
