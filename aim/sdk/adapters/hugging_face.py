from transformers.trainer_callback import TrainerCallback
from aim.engine.utils import convert_to_py_number
from aim.sdk.session.session import Session
from aim.sdk.session.configs import DEFAULT_FLUSH_FREQUENCY
from aim.sdk.flush import flush
import importlib.util

def is_aim_available():
    return importlib.util.find_spec("aim") is not None


class AimCallback(TrainerCallback):
    """
    A :class:`~transformers.TrainerCallback` that sends the logs to `Aim <https://aimstack.io/>`__.
        Args:
        experiment_name (:obj:`str`, `optional`):
            The name of the experiment.
    """

    def __init__(self, experiment_name='default'):
        has_aim = is_aim_available()
        assert has_aim, "AimCallback requires aim to be installed. Run `pip install aim`."
        self._experiment_name = experiment_name
        self._initialized = False
        self._current_split = None

    def setup(self, args, state, model):
        """
        Setup the optional Aim integration.
        """
        self._initialized = True

        self._aim_session = Session(
                        repo=args.logging_dir,
                        experiment=self._experiment_name
                    )

        combined_dict = {**args.to_sanitized_dict()}
        if hasattr(model, "config") and model.config is not None:
            model_config = model.config.to_dict()
            combined_dict = {**model_config, **combined_dict}
        print("yoyo: ", combined_dict)
        self._aim_session.set_params(combined_dict, name='hparams')

    def on_train_begin(self, args, state, control, model=None, **kwargs):
        if not self._initialized:
            self.setup(args, state, model)
        self._current_split = 'train'
    
    def on_evaluate(self, args, state, control, **kwargs):
        self._current_split = 'val'
    
    def on_prediction_step(self, args, state, control, **kwargs):
        self._current_split = 'test'

    def on_log(self, args, state, control, logs=None, **kwargs):
        print("on_log")
        if not self._initialized:
            self.setup(args, state, model)

        context = {}
        for k, v in logs.items():
            context['subset'] = self._current_split
            print("tracking:  ", convert_to_py_number(v), k, context['subset'])    
            self._aim_session.track(convert_to_py_number(v), name=k, **context)
    
    def on_epoch_end(self, args, state, control, **kwargs):
        flush_func = self._aim_session.flush \
            if self._aim_session is not None \
            else flush
        flush_func()

    def on_train_end(self, args, state, control, **kwargs):
        print("on_train_end")
        self._aim_session.close()
