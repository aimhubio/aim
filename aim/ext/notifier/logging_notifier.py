import logging

from typing import Optional

from aim.ext.notifier.base_notifier import BaseNotifier


class LoggingNotifier(BaseNotifier):
    def __init__(self, _id: str, config: dict):
        super().__init__(_id)
        self.message_template = config['message']
        self.logger = logging.getLogger('notifier')

    def notify(self, message: Optional[str] = None, **kwargs):
        message_template = message or self.message_template
        msg = message_template.format(**kwargs)
        self.logger.error(msg)
