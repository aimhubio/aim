import os
from pathlib import Path

from aim.ext.notifier.notifier import Notifier
from aim.ext.notifier.notifier_builder import NotifierBuilder


here = os.path.abspath(os.path.dirname(__file__))


def default_config_path() -> Path:
    return Path(here) / 'config_default.json'


def get_config(config_file: Path) -> dict:
    import json

    with config_file.open() as notif_fh:
        return json.load(notif_fh)


def get_notifier(config_file: Path) -> Notifier:
    base_config = get_config(config_file)
    notif_config = base_config['notifications']
    builder = NotifierBuilder(notif_config['notifiers'])
    return builder.build()


__all__ = ['Notifier', 'get_notifier', 'default_config_path']
