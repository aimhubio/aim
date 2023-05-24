import logging

from aim._ext.notifier.logging_notifier import LoggingNotifier
from aim._ext.notifier.slack_notifier import SlackNotifier
from aim._ext.notifier.workplace_notifier import WorkplaceNotifier
from aim._ext.notifier.notifier import Notifier

logger = logging.getLogger(__name__)


class NotifierBuilder(object):
    _factories = {
        'logger': LoggingNotifier,
        'workplace': WorkplaceNotifier,
        'slack': SlackNotifier
    }

    def __init__(self, config: dict):
        self.config = config

    def build(self) -> Notifier:
        notifier = Notifier()
        for sub_config in self.config.values():
            notif_type = sub_config['type']
            notif_id = sub_config['id']
            args = sub_config['arguments']
            if sub_config['status'] != 'enabled':
                continue
            try:
                notif_cls = self._factories[notif_type]
            except KeyError:
                logger.warning(f'Unknown notifier type {notif_type}. Skipping.')
            else:
                sub_notifier = notif_cls(notif_id, args)
                notifier.add(sub_notifier)
        return notifier
