from typing import Dict, Any

from aim.sdk.run import Run
from aim.sdk.callbacks import Caller, event


# TODO [AT]: This is a draft version. Final list of methods/signatures TBD.
class TrainingFlow(Caller):
    """High-level Run object, resembling the execution flow of the typical training script."""
    def __init__(self, run: Run, callbacks=None):
        super().__init__(callbacks=callbacks)
        self.init()
        self.run = run

    def _extra_kwargs(self) -> Dict[str, Any]:
        kwargs = super()._extra_kwargs()
        kwargs['run'] = self.run

        return kwargs

    @event
    def init(
        self,
        **kwargs
    ):
        """Guaranteed to be called before any other event."""

    @event
    def train_started(
        self, *,
        hparams: Dict[str, Any],
        run: Run,
        **kwargs
    ):
        """Is called just after Run object and hyperparameters are ready."""

    @event
    def train_metrics_available(
        self, *,
        metrics: Dict[str, Any], step: int, epoch: int = None,
        run: Run,
        **kwargs
    ):
        ...

    @event
    def validation_metric_available(
        self, *,
        metrics: Dict[str, Any], step: int, epoch: int = None,
        run: Run,
        **kwargs
    ):
        ...

    @event
    def train_successfully_finished(
        self, *,
        run: Run,
        **kwargs
    ):
        """Is called after the training phase is successfully finished."""

    # @event
    # def run_available_experimental(
    #     self, *,
    #     run: Run,
    #     **kwargs
    # ):
    #     ...
