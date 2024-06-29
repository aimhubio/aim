import os
import shutil

from functools import lru_cache
from pathlib import Path
from typing import Union


here = os.path.abspath(os.path.dirname(__file__))


@lru_cache()
def get_working_directory(base_dir: Union[str, Path]) -> Path:
    if not isinstance(base_dir, Path):
        base_dir = Path(base_dir)
    work_dir = base_dir / 'ext' / 'notifications'
    work_dir.mkdir(parents=True, exist_ok=True)
    return work_dir


def get_config_path(base_dir: Union[str, Path]) -> Path:
    return get_working_directory(base_dir) / 'config.json'


def get_default_config_path() -> Path:
    return Path(here) / 'config_default.json'


def get_empty_config_path() -> Path:
    return Path(here) / 'config_empty.json'


def has_watcher_config(base_dir: Union[str, Path]) -> bool:
    config_path = get_config_path(base_dir)
    return config_path.is_file()


def set_default_config(base_dir: Union[str, Path]):
    config = get_config_path(base_dir)
    default_config = get_default_config_path()
    shutil.copy(default_config, config)
