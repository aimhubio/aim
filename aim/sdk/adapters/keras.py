from typing import Optional

from aim.sdk.session.session import Session
from aim.sdk.adapters.keras_mixins import (
    get_keras_tracker_callback,
    TrackerKerasCallbackMetricsEpochEndMixin,
)


class AimTracker(object):
    __keras_tracker_callback_cls = None

    @classmethod
    def metrics(cls, session: Optional[Session] = None):
        if cls.__keras_tracker_callback_cls is None:
            from keras.callbacks import Callback

            cls.__keras_tracker_callback_cls = get_keras_tracker_callback(
                Callback, [
                    TrackerKerasCallbackMetricsEpochEndMixin,
                ])

        return cls.__keras_tracker_callback_cls(session)
