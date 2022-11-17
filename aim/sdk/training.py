from typing import Dict

from aim.sdk.run import Run
from aim.sdk.callbacks import Caller, trigger


# TODO [AT]: This is a draft version. Final list of methods/signatures TBD.
class TrainingRun(Caller):
    """High-level Run object, resembling the execution flow of the typical training script."""
    def __init__(self, run: Run):
        self.run = run

    @trigger
    def training_begin(self, params):
        ...

    @trigger
    def training_end(self):
        ...

    @trigger
    def batch_end(self, metrics_dict: Dict, *, step, epoch, context):
        ...
