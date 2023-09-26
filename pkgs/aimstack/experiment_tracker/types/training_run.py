from aimstack.asp import Run as BaseRun
from aim import Property


class TrainingRun(BaseRun):
    experiment = Property(default='default')
