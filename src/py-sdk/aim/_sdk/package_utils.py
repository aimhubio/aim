import pathlib
import pkgutil
import importlib
import logging

from typing import Iterable, Dict, List

logger = logging.getLogger(__name__)


class Package:
    pool: Dict[str, 'Package'] = {}

    def __init__(self, name, pkg):
        self.name = name
        self._path = pathlib.Path(pkg.__path__[0])
        self._boards_dir: pathlib.Path = None
        self._boards: List[str] = []
        self._registered_containers = []
        self._registered_sequences = []
        self.register_aim_package_classes(name, pkg)
        self.register_aim_package_boards(pkg)

    @property
    def boards_directory(self) -> pathlib.Path:
        return self._boards_dir

    @property
    def boards(self) -> List[str]:
        return self._boards

    @property
    def containers(self) -> List:
        return self._registered_containers

    @property
    def sequences(self) -> List:
        return self._registered_sequences

    @staticmethod
    def discover(base_pkg):
        discovered_packages = (name for _, name, ispkg in pkgutil.iter_modules(base_pkg.__path__) if ispkg)
        Package.load_packages(base_pkg, discovered_packages)

    @staticmethod
    def load_packages(base_pkg, package_list: Iterable[str]):
        for name in package_list:
            pkg = importlib.import_module(f'{base_pkg.__name__}.{name}')
            Package.pool[name] = Package(name, pkg)

    @staticmethod
    def load_package(package_name: str):
        pkg = importlib.import_module(package_name)
        Package.pool[package_name] = Package(package_name, pkg)

    def register_aim_package_classes(self, name, pkg):
        if not hasattr(pkg, '__aim_types__'):
            return
        from .container import Container
        from .sequence import Sequence
        logger.debug(f'Registering types for Aim package \'{pkg}\'.')
        for aim_type in pkg.__aim_types__:
            logger.debug(f'Registering class \'{aim_type.get_typename()}\'.')
            setattr(aim_type, '__aim_package__', name)
            aim_type.registry[aim_type.get_typename()].append(aim_type)
            if issubclass(aim_type, Container):
                self._registered_containers.append(aim_type.get_typename())
            if issubclass(aim_type, Sequence):
                self._registered_sequences.append(aim_type.get_typename())

    def register_aim_package_boards(self, pkg):
        boards_path = getattr(pkg, '__aim_boards__', 'boards')
        self._boards_dir: pathlib.Path = self._path / boards_path
        if self._boards_dir.exists():
            self._boards = list(map(lambda p: p.relative_to(self._boards_dir), self._boards_dir.glob('**/*.py')))


def register_aimstack_packages():
    logger.debug('Registering Aim packages available at aimstack')
    import aimstack
    Package.discover(aimstack)
