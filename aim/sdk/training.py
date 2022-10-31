from typing import Dict

from aim.sdk.run import Run
from aim.sdk.callbacks import Caller, trigger


# TODO [AT]: This is a draft version. Final list of methods/signatures TBD.
class TrainingRun(Run, Caller):
    """High-level Run object, resembling the execution flow of the typical training script."""

    @trigger
    def training_begin(self, params):
        for name, val in params.items():
            self.set(('hparams', name), params, strict=False)

    @trigger
    def training_end(self):
        self.finalize()

    @trigger
    def batch_end(self, metrics_dict: Dict, *, step, epoch, context):
        for metric_name, val in metrics_dict.items():
            self.track(val, name=metric_name, step=step, epoch=epoch, context=context)
