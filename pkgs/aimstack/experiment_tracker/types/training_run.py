from aimstack.base import Run as BaseRun
from aim import Property


class TrainingRun(BaseRun):
    experiment = Property(default='default')
