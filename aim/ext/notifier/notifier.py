from typing import List, Optional

from aim.ext.notifier.base_notifier import BaseNotifier


class Notifier(BaseNotifier):
    def __init__(self):
        self._notifiers: List[BaseNotifier] = []

    def add(self, sub: BaseNotifier):
        self._notifiers.append(sub)

    def notify(self, message: Optional[str] = None, **kwargs):
        for sub in self._notifiers:
            sub.notify(message, **kwargs)
