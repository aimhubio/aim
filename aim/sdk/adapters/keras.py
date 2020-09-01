from typing import Optional

from aim.engine.utils import get_module
from aim.sdk.track import track
from aim.sdk.session.session import Session


class AimTracker(object):
    keras = None

    _callback_cls = None

    @classmethod
    def _init(cls):
        if cls.keras is None:
            keras = get_module('keras') or get_module('tf.keras')
            cls.keras = keras

        if cls._callback_cls is None:
            class TrackMetricsCallback(cls.keras.callbacks.Callback):
                def __init__(self, session: Optional[Session] = None):
                    super(TrackMetricsCallback, self).__init__()

                    self.session = session

                def on_epoch_end(self, epoch, logs=None):
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
                        track_func(value, name=name, epoch=epoch,
                                   subset='train')

                    val_logs = {k: v for k, v in logs.items() if
                                k.startswith('val_')}
                    for name, value in val_logs.items():
                        track_func(value, name=name[4:], epoch=epoch,
                                   subset='val')

                    lr = self._get_learning_rate()
                    if lr is not None:
                        track_func(lr, name='lr', epoch=epoch, subset='train')

            cls._callback_cls = TrackMetricsCallback

    @classmethod
    def metrics(cls, session: Optional[Session] = None):
        cls._init()
        return cls._callback_cls(session)
