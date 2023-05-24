import pkgutil
import importlib
import hashlib
import logging

from typing import Iterable, Dict

logger = logging.getLogger(__name__)


class Package:
    pool: Dict[str, 'Package'] = {}

    def __init__(self, name, pkg):
        self.name = name
        self._boards = {}
        self._registered_containers = []
        self._registered_sequences = []
        self.register_aim_package_classes(name, pkg)
        self.load_aim_package_boards(pkg)

    @property
    def board_templates(self):
        return self._boards

    @property
    def registered_containers(self):
        return self._registered_containers

    @property
    def registered_sequences(self):
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

    def load_aim_package_boards(self, pkg):
        if not hasattr(pkg, '__aim_board_templates__'):
            return
        logger.debug(f'Loading board templates for Aim package \'{pkg}\'.')
        package_path = pkg.__path__[0]
        for board_name, board_path in pkg.__aim_board_templates__.items():
            board_full_path = f'{package_path}/{board_path}'
            with open(board_full_path, 'r') as f:
                code = f.read()
                checksum = hashlib.md5(code.encode('utf-8')).hexdigest()
                self._boards[board_name] = (code, checksum)


def register_aimstack_packages():
    logger.debug('Registering Aim packages available at aimstack')
    import aimstack
    Package.discover(aimstack)
