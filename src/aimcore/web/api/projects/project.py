import os

from aim._sdk.repo import Repo
from aim._sdk.configs import get_aim_repo_name
from aimcore.web.utils import get_root_path


class Project:
    def __init__(self):
        root_path = get_root_path()
        repo_path = f'{root_path}/{get_aim_repo_name()}'

        self.name = 'My awesome project'
        self.path = root_path
        self.repo_path = repo_path
        self.description = ''
        self.repo = Repo.from_path(self.repo_path, read_only=True)

    def exists(self):
        """
        Checks whether .aim repository is created
        """
        return self.repo and os.path.exists(self.repo_path)
