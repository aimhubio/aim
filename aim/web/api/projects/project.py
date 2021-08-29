import os

from aim.sdk.repo import Repo
from aim.web.utils import get_root_path


class Project:
    _default_repo_path = None  # for unit-tests

    @staticmethod
    def set_repo_path(path: str):
        Project._default_repo_path = path

    def __init__(self):
        root_path = get_root_path()
        repo_path = Project._default_repo_path or '{}/.aim'.format(root_path)

        self.name = 'My awesome project'
        self.path = root_path
        self.repo_path = repo_path
        self.description = ''
        self.repo = Repo.from_path(self.repo_path)

    def exists(self):
        """
        Checks whether .aim repository is created
        """
        return self.repo and os.path.exists(self.repo_path)
