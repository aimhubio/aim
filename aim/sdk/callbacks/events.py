from typing import Callable


# TODO [AT] Tune class/variable naming. Add docstrings, comments
class Events(object):
    """Utility class to decouple trigger declaration from callback definition."""

    class Event(object):
        def __getattr__(self, item: str):
            """Get a decorator to mark a function as a callback for trigger "item"."""
            def make_callback(func: Callable):
                assert callable(func)
                setattr(func, 'callback_triggered_by', item)
                return func

            return make_callback

    @property
    def on(self):
        return Events.Event()


events = Events()
