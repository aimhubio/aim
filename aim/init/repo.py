import shutil
import pkg_resources
import os
import json

from .configs import *
from .utils import is_path_creatable, ls_dir


class AimRepo:
    def __init__(self, path):
        self.path = os.path.join(path, AIM_REPO_NAME)
        self.config_path = os.path.join(self.path, AIM_CONFIG_FILE_NAME)

    def init(self):
        """
        Initializes empty Aim repository
        """
        objects_dir_path = os.path.join(self.path, AIM_OBJECTS_DIR_NAME)
        config_file_path = self.config_path

        # Check whether user has sufficient permissions
        if not is_path_creatable(self.path):
            return False

        # Create `.aim` repo and `objects` directory
        os.mkdir(self.path)
        os.mkdir(objects_dir_path)

        # Create `config` file and fill in default configs
        # TODO: improve relative path
        default_config = pkg_resources.resource_filename(__name__, os.path.join('..', '..', DEFAULT_CONFIG_PATH))
        with open(config_file_path, 'w') as config_file:
            with open(default_config, 'r') as default_config_file:
                for line in default_config_file:
                    config_file.write(line)

        return True

    def rm(self):
        """
        Removes Aim repository
        """
        shutil.rmtree(self.path)

    def exists(self):
        """
        Checks whether Aim repository is initialized
        """
        return os.path.exists(self.path)

    def ls_files(self):
        """
        Returns list containing repository files
        """
        return ls_dir([self.path])

    def get_project_name(self):
        """
        Returns project name from config file
        """
        with open(self.config_path, 'r') as f:
            config = json.load(f)
        return config['project_name']

    def __str__(self):
        return self.path
