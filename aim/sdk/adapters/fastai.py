from logging import getLogger
from typing import Optional

from aim.ext.resource.configs import DEFAULT_SYSTEM_TRACKING_INT
from aim.sdk.run import Run


try:
    from fastai.callback.hook import total_params
    from fastai.learner import Callback
    from fastcore.basics import detuplify, ignore_exceptions, store_attr
except ImportError:
    raise RuntimeError(
        'This contrib module requires fastai to be installed. ' 'Please install it with command: \n pip install fastai'
    )

logger = getLogger(__name__)


class AimCallback(Callback):
    def __init__(
        self,
        repo: Optional[str] = None,
        experiment_name: Optional[str] = None,
        system_tracking_interval: Optional[int] = DEFAULT_SYSTEM_TRACKING_INT,
        log_system_params: [bool] = True,
        capture_terminal_logs: Optional[bool] = True,
    ):
        store_attr()
        self.repo = repo
        self.experiment_name = experiment_name
        self.system_tracking_interval = system_tracking_interval
        self.log_system_params = log_system_params
        self.capture_terminal_logs = capture_terminal_logs
        self._run = None
        self._run_hash = None

    @property
    def experiment(self) -> Run:
        if not self._run:
            self.setup()
        return self._run

    def setup(self, args=None):
        if not self._run:
            if self._run_hash:
                self._run = Run(
                    self._run_hash,
                    repo=self.repo,
                    system_tracking_interval=self.system_tracking_interval,
                    log_system_params=self.log_system_params,
                    capture_terminal_logs=self.capture_terminal_logs,
                )
            else:
                self._run = Run(
                    repo=self.repo,
                    experiment=self.experiment_name,
                    system_tracking_interval=self.system_tracking_interval,
                    log_system_params=self.log_system_params,
                    capture_terminal_logs=self.capture_terminal_logs,
                )
                self._run_hash = self._run.hash

        # Log config parameters
        if args:
            try:
                for key in args:
                    self._run.set(key, args[key], strict=False)
            except Exception as e:
                logger.warning(f'Aim could not log config parameters -> {e}')

    def before_fit(self):
        if not self._run:
            configs_log = self.gather_args()
            formatted_config = AimCallback.format_config(configs_log)
            self.setup(formatted_config)

    def after_batch(self):
        context = {'subset': 'train'} if self.training else {'subset': 'val'}

        self._run.track(self.loss.item(), name='train_loss', step=self.train_iter, context=context)
        for i, h in enumerate(self.opt.hypers):
            for k, v in h.items():
                self._run.track(v, f'{k}_{i}', step=self.train_iter, context=context)

    def before_epoch(self):
        for metric in self.metrics:
            metric.reset()

    def after_epoch(self):
        for name, value in zip(self.recorder.metric_names, self.recorder.log):
            if name not in ['train_loss', 'epoch', 'time'] and value is not None:
                self._run.track(value, name=name)

    def __del__(self):
        if self._run and self._run.active:
            self._run.close()

    def gather_args(self):
        "Gather config parameters accessible to the learner"
        # args stored by 'store_attr'
        cb_args = {f'{cb}': getattr(cb, '__stored_args__', True) for cb in self.cbs if cb != self}
        args = {'Learner': self.learn, **cb_args}
        # input dim
        try:
            n_inp = self.dls.train.n_inp
            args['n_inp'] = n_inp
            xb = self.dls.valid.one_batch()[:n_inp]
            args.update(
                {f'input {n+1} dim {i+1}': d for n in range(n_inp) for i, d in enumerate(list(detuplify(xb[n]).shape))}
            )
        except Exception:
            logger.warning('Failed to gather input dimensions')
        # other args
        with ignore_exceptions():
            args['batch_size'] = self.dls.bs
            args['batch_per_epoch'] = len(self.dls.train)
            args['model_parameters'] = total_params(self.model)[0]
            args['device'] = self.dls.device.type
            args['frozen'] = bool(self.opt.frozen_idx)
            args['frozen_idx'] = self.opt.frozen_idx
            args['dataset', 'tfms'] = f'{self.dls.dataset.tfms}'
            args['dls', 'after_item'] = f'{self.dls.after_item}'
            args['dls', 'before_batch'] = f'{self.dls.before_batch}'
            args['dls', 'after_batch'] = f'{self.dls.after_batch}'
        return args

    @classmethod
    def format_config(cls, config):
        "Format config parameters for logging"
        for key, value in config.items():
            if isinstance(value, dict):
                config[key] = AimCallback.format_config(value)
            else:
                config[key] = AimCallback.format_config_value(value)
        return config

    @classmethod
    def format_config_value(cls, value):
        if isinstance(value, list):
            return [AimCallback.format_config_value(item) for item in value]
        elif hasattr(value, '__stored_args__'):
            return {**AimCallback.format_config(value.__stored_args__), '_name': value}
        return value
