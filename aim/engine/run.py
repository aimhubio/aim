import os
from typing import Optional
import json

from aim.engine.configs import (
    AIM_OBJECTS_DIR_NAME,
    AIM_MAP_DIR_NAME,
)


class Run(object):
    def __init__(self, experiment_name: str, run_hash: str,
                 repo_path: Optional[str] = None):
        self.experiment_name = experiment_name
        self.run_hash = run_hash
        self.repo_path = repo_path
        self._params = None

    @property
    def params(self) -> dict:
        if self._params is None:
            self._params = self.get_params()
        return self._params

    def get_params(self) -> dict:
        params_file_path = os.path.join(self.repo_path,
                                        self.experiment_name,
                                        self.run_hash,
                                        AIM_OBJECTS_DIR_NAME,
                                        AIM_MAP_DIR_NAME,
                                        'dictionary.log')
        try:
            with open(params_file_path, 'r+') as params_file:
                params = json.loads(params_file.read().strip())
        except:
            params = {}
        return params
