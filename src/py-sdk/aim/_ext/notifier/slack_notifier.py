import requests
from typing import Optional

from aim._ext.notifier.base_notifier import BaseNotifier


class SlackNotifier(BaseNotifier):
    def __init__(self, _id: str, config: dict):
        super().__init__(_id)
        self.message_template = config['message']

        self.url = config['url']

    def notify(self, message: Optional[str] = None, **kwargs):
        message_template = message or self.message_template
        msg = message_template.format(**kwargs)
        requests.post(self.url, json={'text': msg})
