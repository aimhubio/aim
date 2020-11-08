from typing import Optional, List

from aim.sdk.track import track
from aim.sdk.flush import flush
from aim.sdk.session.session import Session
from aim.engine.utils import convert_to_py_number


class TrackerKerasCallbackMetricsEpochEndMixin(object):
    def on_epoch_end(self, epoch, logs=None):
        # Log metrics
        self._log_epoch_metrics(epoch, logs)

    def _get_learning_rate(self):
        lr_schedule = getattr(self.model.optimizer, 'lr', None)
        try:
            return lr_schedule(self.model.optimizer.iterations)
        except:
            return None

    def _log_epoch_metrics(self, epoch, logs):
        if not logs:
            return

        track_func = self.session.track \
            if self.session is not None \
            else track

        train_logs = {k: v for k, v in logs.items() if
                      not k.startswith('val_')}
        for name, value in train_logs.items():
            track_func(convert_to_py_number(value), name=name, epoch=epoch,
                       subset='train')

        val_logs = {k: v for k, v in logs.items() if
                    k.startswith('val_')}
        for name, value in val_logs.items():
            track_func(convert_to_py_number(value), name=name[4:], epoch=epoch,
                       subset='val')

        lr = self._get_learning_rate()
        if lr is not None:
            track_func(convert_to_py_number(lr), name='lr', epoch=epoch,
                       subset='train')

        flush_func = self.session.flush \
            if self.session is not None \
            else flush
        flush_func()


def get_keras_tracker_callback(keras_callback_cls, mixins: List):
    class KerasTrackerCallback(keras_callback_cls, *mixins):
        def __init__(self, session: Optional[Session] = None):
            super(KerasTrackerCallback, self).__init__()
            self._session = session

        @property
        def session(self) -> Session:
            return self._session

        def on_epoch_end(self, *args, **kwargs):
            for mixin_cls in mixins:
                if 'on_epoch_end' in mixin_cls.__dict__:
                    mixin_cls.on_epoch_end(self, *args, **kwargs)
                    return

    return KerasTrackerCallback
