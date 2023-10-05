import pathlib
import pkgutil
import importlib
import logging
import sys

from dataclasses import dataclass, field
from typing import Iterable, Dict, List, Tuple, Optional

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class Page:
    name: str
    board_path: str


@dataclass
class Boards:
    boards_dir: str = 'boards'
    pages: Tuple[Page, ...] = field(default_factory=tuple)
    default: Optional[str] = None


class Package:
    pool: Dict[str, 'Package'] = {}
    attributes = ('name', 'category', 'author', 'description')

    def __init__(self, name, pkg):
        self.name = name
        self.description = getattr(pkg, '__description__', None)
        self.author = getattr(pkg, '__author__', None)
        self.category = getattr(pkg, '__category__', None)
        self.hide_boards = getattr(pkg, '__hide_boards__', False)

        self._path = pathlib.Path(pkg.__path__[0])

        self._containers = []
        self._sequences = []
        self.register_package_types(name, pkg)

        self._actions = []
        self.register_package_actions(name, pkg)

        self._boards: Boards = None
        self._boards_dir: pathlib.Path = None
        self._board_files: List[pathlib.Path] = []
        self._pages: List[Dict] = []
        self.register_package_boards(pkg)

    @property
    def boards_directory(self) -> pathlib.Path:
        return self._boards_dir

    @property
    def boards(self) -> List[pathlib.Path]:
        return self._board_files

    @property
    def pages(self) -> List[Dict]:
        return self._pages

    @property
    def containers(self) -> List:
        return self._containers

    @property
    def sequences(self) -> List:
        return self._sequences

    @property
    def actions(self) -> List:
        return self._actions

    @staticmethod
    def discover(base_pkg):
        discovered_packages = (name for _, name, ispkg in pkgutil.iter_modules(base_pkg.__path__) if ispkg)
        Package._load_packages(base_pkg, discovered_packages)

    @staticmethod
    def _load_packages(base_pkg, package_list: Iterable[str]):
        for name in package_list:
            pkg = importlib.import_module(f'{base_pkg.__name__}.{name}')
            Package.pool[name] = Package(name, pkg)

    @staticmethod
    def load_package(package_name: str, src_lookup_dir: Optional[str] = None) -> bool:
        if package_name in Package.pool:
            return True
        try:
            pkg = importlib.import_module(package_name)
            if package_name not in Package.pool:
                Package.pool[package_name] = Package(package_name, pkg)
            return True
        except ModuleNotFoundError:
            if src_lookup_dir is None:
                return False

        sys.path.append(str(pathlib.Path(src_lookup_dir) / package_name / 'src'))
        try:
            pkg = importlib.import_module(package_name)
            if package_name not in Package.pool:
                Package.pool[package_name] = Package(package_name, pkg)
            return True
        except ModuleNotFoundError:
            return False

    def register_package_types(self, name, pkg):
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
                self._containers.append(aim_type.get_typename())
            if issubclass(aim_type, Sequence):
                self._sequences.append(aim_type.get_typename())

    def register_package_actions(self, name, pkg):
        if not hasattr(pkg, '__aim_actions__'):
            return
        from aim._sdk.action import Action
        for action in pkg.__aim_actions__:
            ac = Action(action, name)
            Action.registry[ac.name] = ac
            self._actions.append(ac.name)

    def register_package_boards(self, pkg):
        if hasattr(pkg, '__aim_boards__'):
            if isinstance(pkg.__aim_boards__, str):
                self._boards = Boards(boards_dir=pkg.__aim_boards__)
            else:
                self._boards = pkg.__aim_boards__
        else:
            self._boards = Boards()
        self._boards_dir = self._path / self._boards.boards_dir
        if self._boards_dir.exists():
            logger.debug(f'Registering boards for Aim package \'{pkg}\'.')
            self._board_files = list(map(lambda p: p.relative_to(self._boards_dir), self._boards_dir.glob('**/*.py')))
            self._pages = [{'name': page.name, 'board_path': page.board_path} for page in self._boards.pages]


def register_aimstack_packages():
    logger.debug('Registering Aim packages available at aimstack')
    import aimstack
    Package.discover(aimstack)


def register_package(pkg_name: str):
    Package.load_package(pkg_name)
