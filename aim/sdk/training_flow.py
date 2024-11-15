from typing import Any, Dict

from aim.sdk.callbacks import Caller, event
from aim.sdk.run import Run


# TODO [AT]: This is a draft version. Final list of methods/signatures TBD.
class TrainingFlow(Caller):
    """High-level Run object, resembling the execution flow of the typical training script."""

    def __init__(self, run: Run, callbacks=None):
        super().__init__(callbacks=callbacks)
        self.run = run
        self.init()

    def _extra_kwargs(self) -> Dict[str, Any]:
        kwargs = super()._extra_kwargs()
        kwargs['run'] = self.run

        return kwargs

    @event
    def init(self, **kwargs):
        """Guaranteed to be called before any other event."""

    @event
    def training_started(self, *, hparams: Dict[str, Any], run: Run, **kwargs):
        """Is called just after Run object and hyperparameters are ready."""

    @event
    def training_metrics_collected(self, *, metrics: Dict[str, Any], step: int, epoch: int = None, run: Run, **kwargs):
        """Is called after the training metrics are calculated and ready to be logged."""

    @event
    def validation_metrics_collected(
        self, *, metrics: Dict[str, Any], step: int, epoch: int = None, run: Run, **kwargs
    ):
        """Is called after the validation metrics are calculated and ready to be logged."""

    @event
    def training_successfully_finished(self, *, run: Run, **kwargs):
        """Is called after the training phase is successfully finished."""

    @event
    def exception_raised(self, *, exception: Exception, **kwargs):
        """Is called when exception is raised from Aim codebase."""

    def handle_exceptions(self):
        from aim.ext.exception_resistant import set_exception_callback

        def callback(e: Exception, func: callable):
            self.exception_raised(exception=e, function=func)

        set_exception_callback(callback)

    # @event
    # def run_available_experimental(
    #     self, *,
    #     run: Run,
    #     **kwargs
    # ):
    #     ...
