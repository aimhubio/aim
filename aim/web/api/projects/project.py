import os
from pathlib import Path
import json

from aim.engine.configs import AIM_COMMIT_CONFIG_FILE_NAME

from aim.storage.sdk.repo import Repo
from aim.web.utils import get_root_path


class Project:
    def __init__(self):
        root_path = get_root_path()
        repo_path = '{}/.aim'.format(root_path)

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
