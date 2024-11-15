from collections import defaultdict
from difflib import SequenceMatcher
from logging import getLogger
from typing import Dict, List, Optional

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
    def __init__(
        self,
        repo: Optional[str] = None,
        experiment: Optional[str] = None,
        system_tracking_interval: Optional[int] = DEFAULT_SYSTEM_TRACKING_INT,
        log_system_params: Optional[bool] = True,
        capture_terminal_logs: Optional[bool] = True,
    ):
        self._repo_path = repo
        self._experiment_name = experiment
        self._system_tracking_interval = system_tracking_interval
        self._log_system_params = log_system_params
        self._capture_terminal_logs = capture_terminal_logs
        self._run = None
        self._run_hash = None
        self._log_value_warned = False

    @property
    def experiment(self):
        if not self._run:
            self.setup()
        return self._run

    def setup(self, args=None, state=None, model=None):
        if state and not state.is_world_process_zero:
            return

        if not self._run:
            if self._run_hash:
                self._run = Run(
                    self._run_hash,
                    repo=self._repo_path,
                    system_tracking_interval=self._system_tracking_interval,
                    capture_terminal_logs=self._capture_terminal_logs,
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

        if args:
            combined_dict = {**args.to_sanitized_dict()}
            for key, value in combined_dict.items():
                self._run.set(('hparams', key), value, strict=False)
        if model:
            self._run.set(
                'model', {**vars(model.config), 'num_labels': getattr(model, 'num_labels', None)}, strict=False
            )

        # Store model configs as well
        # if hasattr(model, 'config') and model.config is not None:
        #     model_config = model.config.to_dict()
        #     self._run['model'] = model_config

    def on_init_end(self, args, state, control, **kwargs):
        # Initialize the Aim run on init end so people can track any
        # additional metric (like model load time) in the same aim run.
        self.setup(state=state)

    def on_train_begin(self, args, state, control, model=None, **kwargs):
        # Call setup with args and model to store args and model parameters
        self.setup(args, state, model)

    def on_train_end(self, args, state, control, **kwargs):
        if not state.is_world_process_zero:
            return
        self.close()

    def on_log(self, args, state, control, model=None, logs=None, **kwargs):
        if not state.is_world_process_zero:
            return

        if not self._run:
            self.setup(args, state, model)

        for log_name, log_value in logs.items():
            context = {}
            prefix_set = {'train_', 'eval_', 'test_'}
            for prefix in prefix_set:
                if log_name.startswith(prefix):
                    log_name = log_name[len(prefix) :]
                    context = {'subset': prefix[:-1]}
                    if '_' in log_name:
                        sub_dataset = AimCallback.find_most_common_substring(list(logs.keys())).split(prefix)[-1]
                        if sub_dataset != prefix.rstrip('_'):
                            log_name = log_name.split(sub_dataset)[-1].lstrip('_')
                            context['sub_dataset'] = sub_dataset
                    break
            if not is_number(log_value):
                if not self._log_value_warned:
                    self._log_value_warned = True
                    logger.warning(
                        f'Trainer is attempting to log a value of '
                        f'"{log_value}" of type {type(log_value)} for key "{log_name}"'
                        f' as a metric which is not a supported value type.'
                    )
                continue

            self._run.track(
                log_value,
                name=log_name,
                context=context,
                step=state.global_step,
                epoch=state.epoch,
            )

    def close(self):
        if self._run:
            self._run.close()
            del self._run
            self._run = None

    @staticmethod
    def find_most_common_substring(names: List[str]) -> Dict[str, int]:
        substring_counts = defaultdict(lambda: 0)

        for i in range(0, len(names)):
            for j in range(i + 1, len(names)):
                string1 = names[i]
                string2 = names[j]
                match = SequenceMatcher(None, string1, string2).find_longest_match(0, len(string1), 0, len(string2))
                matching_substring = string1[match.a : match.a + match.size]
                substring_counts[matching_substring] += 1

        return max(substring_counts, key=lambda x: substring_counts[x]).rstrip('_')

    def __del__(self):
        self.close()
