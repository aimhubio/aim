import aim.sdk.callbacks.events

from aim.sdk.callbacks.caller import Caller
from aim.sdk.callbacks.helpers import predefine_event


event = predefine_event

__all__ = ['Caller', 'event', 'events']
