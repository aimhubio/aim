import sys
import subprocess
import pathlib
import shutil
import logging

logger = logging.getLogger(__name__)


class DevPackage:
    def __init__(self, pkgs_dir: str, name: str):
        self._name = name
        self._src_path = pathlib.Path(pkgs_dir) / name
        self._src_path.mkdir(exist_ok=True)

    def install(self):
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-e', str(self._src_path)])

    def sync(self, file, contents):
        logger.debug(f'Syncing contents for file \'{file}\'.')
        full_path = self._src_path / file
        parent_dir = full_path.parent
        parent_dir.mkdir(parents=True, exist_ok=True)
        full_path.touch(exist_ok=True)
        with full_path.open('w+') as fh:
            fh.write(contents)

    def remove(self, file):
        logger.debug(f'Removing file \'{file}\'.')
        full_path = self._src_path / file
        try:
            full_path.unlink()
        except FileNotFoundError:
            pass

    def move(self, src, dest):
        logger.debug(f'Moving file from \'{src}\' to \'{dest}\'.')
        src_full_path = self._src_path / src
        dest_full_path = self._src_path / dest
        shutil.move(src_full_path, dest_full_path)
