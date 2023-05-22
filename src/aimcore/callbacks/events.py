"""Module defining event handler types."""

from typing import Callable

from .helpers import (
    add_handler_event_name,
    check_handler_method_params,
)


class On:
    def __getattr__(self, event_name: str) -> Callable:
        def mark_as_event_handler(method: Callable):
            check_handler_method_params(method)
            add_handler_event_name(method, event_name)
            return method

        return mark_as_event_handler


on = On()


__all__ = ['on']
