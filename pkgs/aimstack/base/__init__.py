from .types.run import Run

from .types.metric import Metric, SystemMetric
from .types.image import Image, ImageSequence
from .types.audio import Audio, AudioSequence
from .types.text import Text, TextSequence
from .types.distribution import Distribution, DistributionSequence
from .types.figures import Figure, Figure3D, FigureSequence, Figure3DSequence
from .types.logging import LogStream, LogRecordSequence

from .actions import get_project_stats, get_sequence_type_preview, get_container_type_preview

__aim_types__ = [
    Run, Metric, SystemMetric,
    TextSequence, ImageSequence, AudioSequence,
    DistributionSequence, FigureSequence, Figure3DSequence, LogStream, LogRecordSequence
]

__aim_actions__ = [get_project_stats, get_sequence_type_preview, get_container_type_preview]

__description__ = 'Base package, providing building blocks for data logging and exploration.'
__author__ = 'AimStack'
__category__ = 'Generic Log Exploration'
