from typing import Optional

from aim.ext.resource.configs import DEFAULT_SYSTEM_TRACKING_INT
from aim.sdk.run import Run


class AimCallback(object):
    __hf_callback_cls = None

    @staticmethod
    def __new__(cls, *args, **kwargs):
        hf_callback_inst = cls.__get_callback_cls()
        return hf_callback_inst(*args, **kwargs)

    @classmethod
    def __get_callback_cls(cls):
        if cls.__hf_callback_cls is not None:
            return cls.__hf_callback_cls

        from transformers.trainer_callback import TrainerCallback

        class _HuggingFaceCallback(TrainerCallback):
            def __init__(self,
                         repo: Optional[str] = None,
                         experiment: Optional[str] = None,
                         system_tracking_interval: Optional[int]
                         = DEFAULT_SYSTEM_TRACKING_INT,
                         ):
                self._repo_path = repo
                self._experiment_name = experiment
                self._system_tracking_interval = system_tracking_interval
                self._initialized = False
                self._current_shift = None
                self._run = None

            def setup(self, args, state, model):
                self._initialized = True

                self._run = Run(
                    repo=self._repo_path,
                    experiment=self._experiment_name,
                    system_tracking_interval=self._system_tracking_interval,
                )

                combined_dict = {**args.to_sanitized_dict()}
                self._run['hparams'] = combined_dict

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
                    self._run.track(log_value, name=log_name, context=context)

            def on_epoch_end(self, args, state, control, **kwargs):
                pass

            def __del__(self):
                if self._initialized and self._run:
                    del self._run
                    self._run = None

        cls.__hf_callback_cls = _HuggingFaceCallback
        return cls.__hf_callback_cls

    def __init__(self,
                 repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 system_tracking_interval: Optional[int]
                 = DEFAULT_SYSTEM_TRACKING_INT,
                 ):
        pass
