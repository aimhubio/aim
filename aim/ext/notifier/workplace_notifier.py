from typing import Optional

import requests

from aim.ext.notifier.base_notifier import BaseNotifier


class WorkplaceNotifier(BaseNotifier):
    def __init__(self, _id: str, config: dict):
        super().__init__(_id)
        self.message_template = config['message']
        self.wp_access_token = config['access_token']
        self.wp_group_id = config['group_id']
        self.url = self._get_workplace_url()

    def notify(self, message: Optional[str] = None, **kwargs):
        message_template = message or self.message_template
        msg = message_template.format(**kwargs)
        params = {'access_token': self.wp_access_token}
        requests.post(self.url, json={'message': msg}, params=params)

    def _get_workplace_url(self):
        api_version = 'v14.0'

        return f'https://graph.facebook.com/{api_version}/{self.wp_group_id}/feed'
