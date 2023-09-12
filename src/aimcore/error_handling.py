import logging

from functools import wraps
from typing import Type, Optional

logger = logging.getLogger(__name__)


class _SafeModeConfig:
    @staticmethod
    def log_exception(e: Exception, func: callable):
        logger.warning(f'Exception "{str(e)}" raised in function "{func.__name__}"')

    @staticmethod
    def reraise_exception(e: Exception, func: callable):
        raise e

    exception_callback = reraise_exception


def enable_safe_mode():
    _SafeModeConfig.exception_callback = _SafeModeConfig.log_exception


def disable_safe_mode():
    _SafeModeConfig.exception_callback = _SafeModeConfig.reraise_exception


def set_exception_callback(callback: callable):
    _SafeModeConfig.exception_callback = callback


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
