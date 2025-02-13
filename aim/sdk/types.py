from enum import Enum

from aim.storage.types import *  # noqa: F403


class QueryReportMode(Enum):
    DISABLED = 0
    PROGRESS_BAR = 1
    PROGRESS_TUPLE = 2
