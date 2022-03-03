from typing import Optional

from aim.sdk.run import Run
from aim.sdk.adapters.keras_mixins import TrackerKerasCallbackMetricsEpochEndMixin

try:
    from keras.callbacks import Callback
except ImportError:
    raise RuntimeError(
        'This contrib module requires keras to be installed. '
        'Please install it with command: \n pip install keras'
    )


class AimCallback(TrackerKerasCallbackMetricsEpochEndMixin, Callback):
    def __init__(self, repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 run: Optional[Run] = None):
        super(Callback, self).__init__()

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

    @classmethod
    def metrics(cls, repo: Optional[str] = None,
                experiment: Optional[str] = None,
                run: Optional[Run] = None):
        # Keep `metrics` method for backward compatibility
        return cls(repo, experiment, run)


# Keep `AimTracker` for backward compatibility
AimTracker = AimCallback
