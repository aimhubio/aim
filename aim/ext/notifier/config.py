import json
import logging
import uuid

from pathlib import Path
from typing import Dict

from aim.ext.notifier.utils import get_empty_config_path


class Config:
    def __init__(self, config_file: Path):
        self._cfg_file: Path = config_file
        self._cfg = {}
        if self.exists():
            self._from_file(self._cfg_file)
        else:
            self._from_file(get_empty_config_path())

    def exists(self) -> bool:
        return self._cfg_file.exists()

    def load(self):
        self._from_file(self._cfg_file)

    def _from_file(self, cfg_file: Path):
        with cfg_file.open() as cfg_fh:
            self._cfg = json.load(cfg_fh)

    def save(self):
        with self._cfg_file.open('w+') as cfg_fh:
            json.dump(self._cfg, cfg_fh, indent=2)

    def dump(self) -> str:
        return json.dumps(self._cfg, indent=2)

    def add(self, config: Dict):
        cfg_id = config['id']
        config['status'] = 'enabled'
        self._cfg['notifications']['notifiers'][cfg_id] = config

    def get(self, cfg_id: uuid.UUID) -> Dict:
        return self.notifiers.get(cfg_id, {})

    def enable(self, cfg_id: uuid.UUID):
        cfg = self.notifiers[cfg_id]
        cfg['status'] = 'enabled'

    def disable(self, cfg_id: uuid.UUID):
        cfg = self.notifiers[cfg_id]
        cfg['status'] = 'disabled'

    def remove(self, cfg_id: uuid.UUID) -> bool:
        if cfg_id in self.notifiers:
            del self.notifiers[cfg_id]
            return True
        return False

    @property
    def notifiers(self) -> Dict:
        return self._cfg['notifications']['notifiers']

    @property
    def log_level(self) -> int:
        return self._cfg['notifications'].get('log_level', logging.WARNING)

    @log_level.setter
    def log_level(self, lvl: int):
        self._cfg['notifications']['log_level'] = lvl
