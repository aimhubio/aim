from typing import Optional

from aim.sdk.run import Run
from aim.sdk.adapters.keras_mixins import (
    get_keras_tracker_callback,
    TrackerKerasCallbackMetricsEpochEndMixin,
)


class AimCallback(object):
    __keras_tracker_callback_cls = None

    @staticmethod
    def __new__(cls, *args, **kwargs):
        keras_callback_cls = cls.__get_callback_cls()
        return keras_callback_cls(*args, **kwargs)

    @classmethod
    def __get_callback_cls(cls):
        if cls.__keras_tracker_callback_cls is None:
            from keras.callbacks import Callback

            cls.__keras_tracker_callback_cls = get_keras_tracker_callback(
                Callback, [
                    TrackerKerasCallbackMetricsEpochEndMixin,
                ])
        return cls.__keras_tracker_callback_cls

    @classmethod
    def metrics(cls, repo: Optional[str] = None,
                experiment: Optional[str] = None,
                run: Optional[Run] = None):
        # Keep `metrics` method for backward compatibility
        return cls(repo, experiment, run)

    def __init__(self, repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 run: Optional[Run] = None):
        pass


# Keep `AimTracker` for backward compatibility
AimTracker = AimCallback
