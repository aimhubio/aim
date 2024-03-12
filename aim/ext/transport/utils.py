import logging

from functools import wraps
from typing import Type, Optional

logger = logging.getLogger(__name__)


def handle_exception(exc_type: Type[Exception], error_message: Optional[str] = None):
    def inner(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except exc_type as e:  # noqa
                if error_message is not None:
                    logger.error(error_message)
                    raise RuntimeError(error_message)
                else:  # silent mode
                    pass
        return wrapper
    return inner
