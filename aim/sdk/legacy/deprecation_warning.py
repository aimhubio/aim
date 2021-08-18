import logging
from functools import wraps

logger = logging.getLogger(__name__)


def deprecated(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        logger.warning(msg=f'Usage of {func.__qualname__} is deprecated!')
        return func(*args, **kwargs)

    return wrapper
