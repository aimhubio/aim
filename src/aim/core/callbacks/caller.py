import logging
import inspect
import traceback
import weakref
from collections import defaultdict
from typing import Callable, List, Optional, Dict, Any

from .helpers import handles_events, get_handler_event_names
logger = logging.getLogger(__name__)


CallbackHandler = Any


class Caller(object):
    def __init__(self, callbacks: Optional[List['CallbackHandler']] = None):
        self._handlers: Dict[str, List[Callable]] = defaultdict(list)

        if callbacks is None:
            callbacks = []
        for ch in callbacks:
            self.register(ch)

    def register(self, callbacks: 'CallbackHandler'):
        for _, callback in inspect.getmembers(callbacks, handles_events):
            self._bind_events_for(callback)

    def _bind_events_for(self, callback: Callable):
        for e_name in get_handler_event_names(callback):
            self._handlers[e_name].append(weakref.WeakMethod(callback))

    def _extra_kwargs(self) -> Dict[str, Any]:
        return {'_caller_': self}

    def trigger(self, event_name: str, **kwargs):
        all_kwargs = self._extra_kwargs()
        all_kwargs.update(kwargs)

        handlers = self._handlers.get(event_name, [])
        for handler in handlers:
            handler = handler()
            if handler:
                try:
                    handler(**all_kwargs)
                except Exception:  # noqa
                    # TODO catch errors on handler invocation (nice-to-have)
                    logger.warning(f'Failed to run callback \'{handler.__name__}\'.')
                    logger.warning(traceback.format_exc())
