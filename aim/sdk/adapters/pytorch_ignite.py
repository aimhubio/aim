from typing import Any, Callable, Dict, List, Optional, Union

from aim import Run
from aim.ext.resource.configs import DEFAULT_SYSTEM_TRACKING_INT

try:
    from torch.optim import Optimizer
except ImportError:
    raise RuntimeError(
        "This contrib module requires pytorch to be installed. "
        "Please install it with command: \n pip install torch"
    )
try:
    from ignite.contrib.handlers.base_logger import BaseLogger, BaseOptimizerParamsHandler, BaseOutputHandler
    from ignite.engine import Engine, Events
except ImportError:
    raise RuntimeError(
        "This contrib module requires pythorch_ignite to be installed. "
        "Please install it with command: \n pip install pythorch_ignite"
    )


class AimLogger(BaseLogger):
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
    def experiment(self) -> Run:
        if self._run is None:
            self._run = Run(
                repo=self._repo_path,
                experiment=self._experiment_name,
                system_tracking_interval=self._system_tracking_interval
            )
        return self._run

    def log_params(self, params: dict):
        # Handle OmegaConf object
        try:
            from omegaconf import OmegaConf, Container
        except ModuleNotFoundError:
            pass
        else:
            # Convert to primitives
            if isinstance(params, Container):
                params = OmegaConf.to_container(params, resolve=True)

        hparams = self.experiment.meta_run_attrs_tree.subtree('hparams')
        for key, value in params.items():
            hparams.set(key, value, strict=False)

    def log_metrics(self, metrics: Dict[str, float],
                    step: Optional[int] = None):
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
            self.experiment.track(v, step=step, name=name, context=context)

    @property
    def save_dir(self) -> str:
        return self.experiment.repo.path

    @property
    def name(self) -> str:
        return self._experiment_name

    @property
    def version(self) -> str:
        return self.experiment.hash

    def close(self) -> None:
        self._run.finalize()

    def _create_output_handler(self, *args: Any, **kwargs: Any) -> "OutputHandler":
        return OutputHandler(*args, **kwargs)

    def _create_opt_params_handler(self, *args: Any, **kwargs: Any) -> "OptimizerParamsHandler":
        return OptimizerParamsHandler(*args, **kwargs)


class OutputHandler(BaseOutputHandler):
    def __init__(
        self,
        tag: str,
        metric_names: Optional[Union[str, List[str]]] = None,
        output_transform: Optional[Callable] = None,
        global_step_transform: Optional[Callable] = None,
        state_attributes: Optional[List[str]] = None,
    ) -> None:
        super(OutputHandler, self).__init__(
            tag, metric_names, output_transform, global_step_transform, state_attributes
        )

    def __call__(self, engine: Engine, logger: AimLogger, event_name: Union[str, Events]) -> None:

        if not isinstance(logger, AimLogger):
            raise TypeError("Handler 'OutputHandler' works only with AimLogger")

        rendered_metrics = self._setup_output_metrics_state_attrs(engine)

        global_step = self.global_step_transform(engine, event_name)  # type: ignore[misc]

        if not isinstance(global_step, int):
            raise TypeError(
                f"global_step must be int, got {type(global_step)}."
                " Please check the output of global_step_transform."
            )

        metrics = {}
        for keys, value in rendered_metrics.items():
            key = "_".join(keys)
            metrics[key] = value

        logger.log_metrics(metrics, step=global_step)


class OptimizerParamsHandler(BaseOptimizerParamsHandler):
    def __init__(self, optimizer: Optimizer, param_name: str = "lr", tag: Optional[str] = None):
        super(OptimizerParamsHandler, self).__init__(optimizer, param_name, tag)

    def __call__(self, engine: Engine, logger: AimLogger, event_name: Union[str, Events]) -> None:
        if not isinstance(logger, AimLogger):
            raise TypeError("Handler OptimizerParamsHandler works only with AimLogger")

        global_step = engine.state.get_event_attrib_value(event_name)
        tag_prefix = f"{self.tag}_" if self.tag else ""
        params = {
            f"{tag_prefix}{self.param_name}_group_{i}": float(param_group[self.param_name])
            for i, param_group in enumerate(self.optimizer.param_groups)
        }

        logger.log_metrics(params, step=global_step)
