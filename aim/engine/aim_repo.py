import shutil
import pkg_resources
import os
import json

from .configs import *
from .utils import is_path_creatable, ls_dir


class AimRepo:
    @staticmethod
    def get_working_repo():
        """
        Searches for .aim repository in working directory
        and returns AimRepo object if exists
        """
        # Get working directory path
        working_dir = os.environ['PWD']

        # Try to find closest .aim repository
        repo_found = False
        while True:
            if len(working_dir) <= 1:
                break

            if os.path.exists(os.path.join(working_dir, AIM_REPO_NAME)):
                repo_found = True
                break
            else:
                working_dir = os.path.split(working_dir)[0]

        if not repo_found:
            return None

        return AimRepo(working_dir)

    def __init__(self, path):
        self.path = os.path.join(path, AIM_REPO_NAME)
        self.config_path = os.path.join(self.path, AIM_CONFIG_FILE_NAME)
        self.objects_dir_path = os.path.join(self.path, AIM_OBJECTS_DIR_NAME)
        self._config = None

    @property
    def config(self):
        """
        Config property getter, loads config file if not already loaded and
        returns json object
        """
        if self._config is None:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
            self._config = config
        return self._config

    @config.setter
    def config(self, config):
        self._config = config

    def save_config(self):
        """
        Saves object config to config file
        """
        with open(self.config_path, 'w') as f:
            f.write(json.dumps(self._config))

    def get_project_name(self):
        """
        Returns project name from config file
        """
        config = self.config
        return config['project_name']

    def get_remote_url(self, remote_name):
        """
        Returns remote url specified by remote name
        """
        for i in self.config['remotes']:
            if i['name'] == remote_name:
                return i['url']
        return None

    def init(self):
        """
        Initializes empty Aim repository
        """
        # Check whether user has sufficient permissions
        if not is_path_creatable(self.path):
            return False

        # Create `.aim` repo and `objects` directory
        os.mkdir(self.path)
        os.mkdir(self.objects_dir_path)

        # Create `config` file and fill in default configs
        # TODO: improve relative path
        default_config_path = os.path.join('..', '..', DEFAULT_CONFIG_PATH)
        default_config = pkg_resources.resource_filename(__name__,
                                                         default_config_path)

        with open(self.config_path, 'w') as config_file:
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

    def get_object_paths(self, name):
        """
        Get tracking object paths (directory_path, metafile_path, datafile_path)
        """
        return (os.path.join(self.objects_dir_path, name),
                os.path.join(self.objects_dir_path, name, 'meta.json'),
                os.path.join(self.objects_dir_path, name, 'data.json'))

    def add_object_val(self, name, val, step):
        """
        Appends new data to specified object
        """
        dir_path, meta_file_path, data_file_path = self.get_object_paths(name)

        if not os.path.isdir(dir_path):
            # Create object directory
            os.mkdir(dir_path)

            # Init default content if object does not exist
            meta_file_content = {
                "name": name,
                "step": 0,
            }
            data_file_content = []

            # Create and open object files
            meta_file = open(meta_file_path, 'w+')
            data_file = open(data_file_path, 'w+')
        else:
            # Open object meta file and data file
            meta_file = open(meta_file_path, 'r+')
            data_file = open(data_file_path, 'r+')

            # Get object content
            meta_file_content = json.loads(meta_file.read())
            data_file_content = json.loads(data_file.read())

        # Update and close meta file
        meta_file_content['step'] += 1
        meta_file.seek(0)
        meta_file.truncate()
        meta_file.write(json.dumps(meta_file_content))
        meta_file.close()

        # Update and close data file
        data_file_content.append(val)
        data_file.seek(0)
        data_file.truncate()
        data_file.write(json.dumps(data_file_content))
        data_file.close()

    def __str__(self):
        return self.path
