from aim._ext.notifier.notifier import Notifier, NotificationSendError
from aim._ext.notifier.notifier_builder import NotifierBuilder
from aim._ext.notifier.config import Config
from aim._ext.notifier.utils import get_config_path


def get_config(base_dir) -> Config:
    config_file = get_config_path(base_dir)
    return Config(config_file)


def get_notifier(base_dir) -> Notifier:
    cfg = get_config(base_dir)
    cfg.load()
    builder = NotifierBuilder(cfg.notifiers)
    return builder.build()


__all__ = ['Notifier', 'NotificationSendError', 'Config', 'get_config', 'get_notifier']
