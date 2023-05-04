import inspect

from typing import Callable, Set


def handles_events(method: Callable) -> bool:
    return hasattr(method, '_handled_events_set_')


def get_handler_event_names(method: Callable) -> Set[str]:
    return getattr(method, '_handled_events_set_', set())


def add_handler_event_name(method: Callable, event_name: str):
    event_names = getattr(method, '_handled_events_set_', set())
    event_names.add(event_name)
    setattr(method, '_handled_events_set_', event_names)


def check_handler_method_params(method: Callable):
    # TODO better error handling. actionable messages
    signature = inspect.signature(method)
    first, *params, last = list(signature.parameters.items())

    first_param_name, _ = first
    assert first_param_name == 'self'
    for _, param in params:
        assert param.kind not in (inspect.Parameter.POSITIONAL_ONLY, inspect.Parameter.VAR_POSITIONAL)
    _, last_param = last
    assert last_param.kind == inspect.Parameter.VAR_KEYWORD


def predefine_event(func):
    forbidden_param_kinds = (inspect.Parameter.POSITIONAL_ONLY, inspect.Parameter.VAR_POSITIONAL)
    signature = inspect.signature(func)
    for param in signature.parameters.values():
        assert param.kind not in forbidden_param_kinds

    def handle_event(self, **kwargs):
        # TODO allow calls w/ positional arguments?
        self.trigger(func.__name__, **kwargs)

    return handle_event
