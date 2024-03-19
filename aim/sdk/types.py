from aim.storage.types import *  # noqa F401
from enum import Enum


class QueryReportMode(Enum):
    DISABLED = 0
    PROGRESS_BAR = 1
    PROGRESS_TUPLE = 2
