from typing import Optional

from aim.engine.utils import convert_to_py_number
from aim.sdk.session.session import Session
from aim.sdk.flush import flush

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
            def __init__(self, experiment_name: Optional[str] = None):
                self._experiment_name = experiment_name
                self._initialized = False
                self._current_shfit = None

            def setup(self, args, state, model):
                self._initialized = True

                self._aim_session = Session(
                                repo=args.logging_dir,
                                experiment=self._experiment_name
                            )

                combined_dict = {**args.to_sanitized_dict()}
                if hasattr(model, "config") and model.config is not None:
                    model_config = model.config.to_dict()
                    combined_dict = {**model_config, **combined_dict}
                self._aim_session.set_params(combined_dict, name='hparams')

            def on_train_begin(self, args, state, control, model=None, **kwargs):
                if not self._initialized:
                    self.setup(args, state, model)
                self._current_shfit = 'train'
            
            def on_evaluate(self, args, state, control, **kwargs):
                self._current_shfit = 'val'
            
            def on_prediction_step(self, args, state, control, **kwargs):
                self._current_shfit = 'pred'

            def on_log(self, args, state, control, logs=None, **kwargs):
                if not self._initialized:
                    self.setup(args, state, model)

                context = {}
                for k, v in logs.items():
                    context['subset'] = self._current_shfit
                    self._aim_session.track(convert_to_py_number(v), name=k, **context)
            
            def on_epoch_end(self, args, state, control, **kwargs):
                flush_func = self._aim_session.flush \
                    if self._aim_session is not None \
                    else flush
                flush_func()

            def __del__(self):
                if self._initialized:
                    self._aim_session.close()

        cls.__hf_callback_cls = _HuggingFaceCallback
        return cls.__hf_callback_cls

    def __init__(self, experiment: Optional[str] = None ):
        pass
