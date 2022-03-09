from logging import getLogger
from typing import Any, Dict, Optional

from aim.ext.resource.configs import DEFAULT_SYSTEM_TRACKING_INT
from aim.sdk.num_utils import is_number
from aim.sdk.run import Run

try:
    from transformers.trainer_callback import TrainerCallback
except ImportError:
    raise RuntimeError(
        'This contrib module requires Transformers to be installed. '
        'Please install it with command: \n pip install transformers'
    )

logger = getLogger(__name__)


class AimCallback(TrainerCallback):
    def __init__(self,
                 repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 system_tracking_interval: Optional[int]
                 = DEFAULT_SYSTEM_TRACKING_INT,
                 run_params: Optional[Dict[str, Any]] = None,
                 ):
        self._repo_path = repo
        self._experiment_name = experiment
        self._system_tracking_interval = system_tracking_interval
        self._initialized = False
        self._current_shift = None
        self._run = None
        self._run_params = run_params
        self._log_value_warned = False

    @property
    def experiment(self):
        return self._run if self._run else None

    def setup(self, args, state, model):
        self._initialized = True

        self._run = Run(
            repo=self._repo_path,
            experiment=self._experiment_name,
            system_tracking_interval=self._system_tracking_interval,
        )

        combined_dict = {**args.to_sanitized_dict()}
        self._run['hparams'] = combined_dict
        if self._run_params:
            self._run['run_params'] = self._run_params

        # Store model configs as well
        # if hasattr(model, 'config') and model.config is not None:
        #     model_config = model.config.to_dict()
        #     self._run['model'] = model_config

    def on_train_begin(self, args, state, control,
                       model=None, **kwargs):
        if not self._initialized:
            self.setup(args, state, model)
        self._current_shift = 'train'

    def on_evaluate(self, args, state, control, **kwargs):
        self._current_shift = 'val'

    def on_prediction_step(self, args, state, control, **kwargs):
        self._current_shift = 'pred'

    def on_log(self, args, state, control,
               model=None, logs=None, **kwargs):
        if not self._initialized:
            self.setup(args, state, model)

        context = {
            'subset': self._current_shift,
        }
        for log_name, log_value in logs.items():
            if not is_number(log_value):
                if not self._log_value_warned:
                    self._log_value_warned = True
                    logger.warning(
                        f'Trainer is attempting to log a value of '
                        f'"{log_value}" of type {type(log_value)} for key "{log_name}"'
                        f' as a metric which is not a supported value type.'
                    )
                continue

            self._run.track(log_value, name=log_name, context=context)

    def on_epoch_end(self, args, state, control, **kwargs):
        pass

    def __del__(self):
        if self._initialized and self._run:
            self._run.close()
            del self._run
            self._run = None
