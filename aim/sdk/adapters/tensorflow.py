from typing import Optional
from distutils.version import LooseVersion

from aim.sdk.session.session import Session
from aim.sdk.adapters.keras_mixins import (
    get_keras_tracker_callback,
    TrackerKerasCallbackMetricsEpochEndMixin,
)


class AimCallback(object):
    __tf1_keras_tracker_callback_cls = None
    __tf2_keras_tracker_callback_cls = None

    @staticmethod
    def __new__(cls, *args, **kwargs):
        keras_callback_cls = cls.__get_callback_cls()
        return keras_callback_cls(*args, **kwargs)

    @classmethod
    def __get_callback_cls(cls):
        import tensorflow
        if LooseVersion(tensorflow.__version__) < LooseVersion('2.0.0'):
            tf_keras_callback_cls = cls.__get_tf1_keras_tracker_callback_cls()
        else:
            tf_keras_callback_cls = cls.__get_tf2_keras_tracker_callback_cls()
        return tf_keras_callback_cls

    @classmethod
    def __get_tf1_keras_tracker_callback_cls(cls):
        if cls.__tf1_keras_tracker_callback_cls is None:
            from tensorflow.keras.callbacks import Callback

            cls.__tf1_keras_tracker_callback_cls = get_keras_tracker_callback(
                Callback, [
                    TrackerKerasCallbackMetricsEpochEndMixin,
                ])

        return cls.__tf1_keras_tracker_callback_cls

    @classmethod
    def __get_tf2_keras_tracker_callback_cls(cls):
        if cls.__tf2_keras_tracker_callback_cls is None:
            from tensorflow.keras.callbacks import Callback

            cls.__tf2_keras_tracker_callback_cls = get_keras_tracker_callback(
                Callback, [
                    TrackerKerasCallbackMetricsEpochEndMixin,
                ])

        return cls.__tf2_keras_tracker_callback_cls

    @classmethod
    def metrics(cls, session: Optional[Session] = None):
        # Keep `metrics` method for backward compatibility
        return cls(session)

    def __init__(self, session: Optional[Session] = None):
        pass


# Keep `AimTracker` for backward compatibility
AimTracker = AimCallback
