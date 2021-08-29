from typing import Optional, List
from aim.sdk.run import Run


class TrackerKerasCallbackMetricsEpochEndMixin(object):
    def on_epoch_end(self, epoch, logs=None):
        # Log metrics
        self._log_epoch_metrics(epoch, logs)

    def _get_learning_rate(self):
        lr_schedule = getattr(self.model.optimizer, 'lr', None)
        try:
            return lr_schedule(self.model.optimizer.iterations)
        except Exception:
            return None

    def _log_epoch_metrics(self, epoch, logs):
        if not logs:
            return

        track_func = self.run.track

        train_logs = {k: v for k, v in logs.items() if
                      not k.startswith('val_')}
        for name, value in train_logs.items():
            track_func(value, name=name, epoch=epoch, context={'subset': 'train'})

        val_logs = {k: v for k, v in logs.items() if
                    k.startswith('val_')}
        for name, value in val_logs.items():
            track_func(value, name=name[4:], epoch=epoch, context={'subset': 'val'})

        lr = self._get_learning_rate()
        if lr is not None:
            track_func(lr, name='lr', epoch=epoch, context={'subset': 'train'})


def get_keras_tracker_callback(keras_callback_cls, mixins: List):
    class KerasTrackerCallback(keras_callback_cls, *mixins):
        def __init__(self, repo: Optional[str] = None,
                     experiment: Optional[str] = None,
                     run: Optional[Run] = None):
            super(KerasTrackerCallback, self).__init__()

            if run is None:
                if repo is None and experiment is None:
                    self._run = Run()
                else:
                    self._run = Run(repo=repo, experiment=experiment)
            else:
                print('Passing Run instance to AimCallback will be '
                      'deprecated in future versions, '
                      'pass the callback arguments explicitly')
                self._run = run

        @property
        def run(self) -> Run:
            return self._run

        def on_epoch_end(self, *args, **kwargs):
            for mixin_cls in mixins:
                if 'on_epoch_end' in mixin_cls.__dict__:
                    mixin_cls.on_epoch_end(self, *args, **kwargs)
                    return

    return KerasTrackerCallback
