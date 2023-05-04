import logging
import time
from typing import List, Optional

from aim.ext.notifier.base_notifier import BaseNotifier

logger = logging.getLogger(__name__)


class NotificationSendError(RuntimeError):
    def __init__(self, e: Exception):
        super().__init__(e)


class Notifier(BaseNotifier):
    MAX_RETRIES = 5
    RETRY_DELAY = 1

    def __init__(self):
        self._notifiers: List[BaseNotifier] = []

    def add(self, sub: BaseNotifier):
        self._notifiers.append(sub)

    def notify(self, message: Optional[str] = None, **kwargs):
        for sub in self._notifiers:
            attempt = 0
            while attempt < self.MAX_RETRIES:
                try:
                    sub.notify(message, **kwargs)
                    break
                except Exception as e:
                    attempt += 1
                    if attempt == self.MAX_RETRIES:
                        logger.error(f'Notifier {sub} failed to send message "{message}". '
                                     f'No retries left.')
                        raise NotificationSendError(e)
                    else:
                        logger.error(f'Notifier {sub} failed to send message "{message}". '
                                     f'Retry attempts left {self.MAX_RETRIES - attempt} '
                                     f'Next retry in {self.RETRY_DELAY} seconds.')
                        time.sleep(self.RETRY_DELAY)
