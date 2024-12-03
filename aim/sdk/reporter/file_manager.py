import logging

from abc import abstractmethod
from pathlib import Path
from typing import Optional, Union


logger = logging.getLogger(__name__)


class FileManager(object):
    @abstractmethod
    def poll(self, pattern: str) -> Optional[str]:
        ...

    @abstractmethod
    def touch(self, filename: str, cleanup_file_pattern: Optional[str] = None):
        ...


class LocalFileManager(FileManager):
    def __init__(self, base_dir: Union[Path, str], watch_dir_name: Optional[str] = 'check_ins'):
        if not isinstance(base_dir, Path):
            base_dir = Path(base_dir)

        self.base_dir = base_dir / watch_dir_name

    def __repr__(self):
        return repr(self.base_dir)

    def poll(self, pattern: str) -> Optional[str]:
        paths = list(self.base_dir.glob(pattern))
        if not paths:
            return None
        return max(paths).name

    def touch(self, filename: str, cleanup_file_pattern: Optional[str] = None):
        self.base_dir.mkdir(parents=True, exist_ok=True)
        new_path = self.base_dir / filename
        logger.debug(f'touching check-in: {new_path}')
        new_path.touch(exist_ok=True)
        if cleanup_file_pattern is not None:
            self._cleanup(cleanup_file_pattern)

    def _cleanup(self, pattern: str) -> Path:
        *paths_to_remove, max_path = sorted(self.base_dir.glob(pattern))
        logger.debug(f'found {len(paths_to_remove)} check-ins:')
        logger.debug(f'the acting one: {max_path}')

        for path in paths_to_remove:
            logger.debug(f'check-in {path} is being removed')
            try:
                # Ignore errors, as the file may have been removed already.
                path.unlink()
            except OSError:
                pass
            logger.debug(f'check-in {path} removed')

        return max_path
