from enum import Enum
from aim._core.storage.types import *  # noqa F401


class QueryReportMode(Enum):
    DISABLED = 0
    PROGRESS_BAR = 1
    PROGRESS_TUPLE = 2
