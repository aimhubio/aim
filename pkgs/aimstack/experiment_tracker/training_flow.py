from typing import Dict, Any

from aimstack.experiment_tracker import TrainingRun
from aimcore.callbacks import Caller, event


# TODO [AT]: This is a draft version. Final list of methods/signatures TBD.
class TrainingFlow(Caller):
    """High-level Flow object, resembling the execution flow of the typical training script."""
    def __init__(self, run: TrainingRun, callbacks=None):
        super().__init__(callbacks=callbacks)
        self.run = run
        self.init()

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
    def training_started(
        self, *,
        hparams: Dict[str, Any],
        run: TrainingRun,
        **kwargs
    ):
        """Is called just after Run object and hyperparameters are ready."""

    @event
    def training_metrics_collected(
        self, *,
        metrics: Dict[str, Any], step: int, epoch: int = None,
        run: TrainingRun,
        **kwargs
    ):
        """Is called after the training metrics are calculated and ready to be logged."""

    @event
    def validation_metrics_collected(
        self, *,
        metrics: Dict[str, Any], step: int, epoch: int = None,
        run: TrainingRun,
        **kwargs
    ):
        """Is called after the validation metrics are calculated and ready to be logged."""

    @event
    def training_successfully_finished(
        self, *,
        run: TrainingRun,
        **kwargs
    ):
        """Is called after the training phase is successfully finished."""

    @event
    def exception_raised(
        self, *,
        exception: Exception,
        **kwargs
    ):
        """Is called when exception is raised from Aim codebase. """

    def handle_exceptions(self):
        from aimcore.error_handling import set_exception_callback

        def callback(e: Exception, func: callable):
            self.exception_raised(exception=e, function=func)
        set_exception_callback(callback)
