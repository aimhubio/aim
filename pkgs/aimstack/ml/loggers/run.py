from aimstack.asp import Run as BaseRun
from aim import Property


class Run(BaseRun):
    experiment = Property(default='default')
