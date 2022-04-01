import os
import logging
from aim.web.configs import AIM_LOG_LEVEL_KEY


def set_log_level(log_level):
    numeric_level = getattr(logging, log_level.upper(), None)
    if not isinstance(numeric_level, int):
        raise ValueError('Invalid log level: %s' % log_level)
    os.environ[AIM_LOG_LEVEL_KEY] = str(numeric_level)
    logging.basicConfig(level=numeric_level)
