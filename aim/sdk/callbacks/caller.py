import string
import random
import logging
import functools
from collections import defaultdict

logger = logging.getLogger(__name__)


class CallerMeta(type):
    """MetaClass to keep track of object methods marked as callback triggers."""

    # Random string to be used as an attribute name suffix.
    # This will allow to avoid potential collisions with user-defined attributes.
    seed = ''.join(random.choice(string.ascii_lowercase) for _ in range(16))

    is_trigger_flag = f'is_trigger_fn_{seed}'
    trigger_methods_fn = f'triggers_{seed}'

    def __new__(mcls, name, bases, namespace, **kwargs):
        cls_triggers = set()
        for base in bases:
            if hasattr(base, CallerMeta.trigger_methods_fn):
                base_triggers = getattr(base, CallerMeta.trigger_methods_fn)()
                cls_triggers.update(base_triggers)

        for trigger_candidate_name, trigger_candidate in namespace.items():
            if getattr(trigger_candidate, CallerMeta.is_trigger_flag, False) is True:
                cls_triggers.add(trigger_candidate_name)
            elif trigger_candidate_name in cls_triggers:
                logger.warning(f'Method \'{trigger_candidate_name}\' was marked as callback trigger '
                               f'in base classes of \'{name}\'. '
                               f'Have you forgot to add \'@trigger\' to \'{trigger_candidate_name}\'?')
                cls_triggers.remove(trigger_candidate_name)

        def get_triggers_fn(cls):
            return cls._triggers

        namespace['_triggers'] = cls_triggers
        namespace[CallerMeta.trigger_methods_fn] = classmethod(get_triggers_fn)

        type_ = type.__new__(mcls, name, bases, namespace, **kwargs)
        return type_


class Caller(object, metaclass=CallerMeta):
    """Base class for callback trigger classes.

    Provides @trigger decorator, used to mark methods to bind callbacks to.
    """
    _callbacks = None

    @staticmethod
    def trigger(method):
        logger.debug(f'Registering trigger for method \'{method.__qualname__}\'.')
        setattr(method, CallerMeta.is_trigger_flag, True)

        @functools.wraps(method)
        def wrapped(self, *args, **kwargs):
            logger.debug(f'Calling trigger method \'{method.__qualname__}\'.')

            res = method(self, *args, **kwargs)
            callbacks = self.callbacks.get(method.__name__, ())
            for callback in callbacks:
                try:
                    callback(self, *args, **kwargs)
                except Exception as e:  # noqa
                    # Handle ALL exceptions. Do not throw error if one of the callbacks failed.
                    logger.warning(f'Failed to run callback \'{callback.__name__}\'.')
                    logger.warning(f'Reason: {e}')
            return res

        return wrapped

    @property
    def callbacks(self):
        if self._callbacks is None:
            self._callbacks = defaultdict(list)
        return self._callbacks

    def register(self, callbacks):
        triggers = getattr(self, CallerMeta.trigger_methods_fn)()
        attr_names = dir(callbacks)

        for attr in attr_names:
            callback_candidate = getattr(callbacks, attr)
            if hasattr(callback_candidate, 'callback_triggered_by'):
                trigger_name = callback_candidate.callback_triggered_by
                if trigger_name in triggers:
                    self.callbacks[trigger_name].append(callback_candidate)
                else:
                    logger.warning(f'Object of class \'{self.__class__}\' '
                                   f'does not have a trigger method \'{trigger}\'.')


trigger = Caller.trigger
