from .types.run import Run

from .types.metric import Metric, SystemMetric
from .types.image import Image, ImageSequence
from .types.audio import Audio, AudioSequence
from .types.text import Text, TextSequence
from .types.distribution import Distribution, DistributionSequence
from .types.figures import Figure, Figure3D, FigureSequence, Figure3DSequence
from .types.logging import LogStream, LogRecordSequence

from aim import Boards, Page

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

overview_page = Page(name='Overview', board_path='logs_overview.py')
metrics_page = Page(name='Logged Metrics', board_path='metrics.py')
runs_page = Page(name='Logged Runs', board_path='runs.py')

__aim_boards__ = Boards(default='Overview', pages=(overview_page, metrics_page, runs_page))
