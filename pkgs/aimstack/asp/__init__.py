from .loggers.run import Run

from .loggers.metric import Metric, SystemMetric
from .loggers.image import Image, ImageSequence
from .loggers.audio import Audio, AudioSequence
from .loggers.text import Text, TextSequence
from .loggers.distribution import Distribution, DistributionSequence
from .loggers.figures import Figure, Figure3D, FigureSequence, Figure3DSequence
from .loggers.logging import LogStream, LogRecordSequence

from .loggers.functions import get_project_stats

__aim_types__ = [
    Run, Metric, SystemMetric,
    TextSequence, ImageSequence, AudioSequence,
    DistributionSequence, FigureSequence, Figure3DSequence, LogStream, LogRecordSequence
]

__aim_actions__ = [get_project_stats]
