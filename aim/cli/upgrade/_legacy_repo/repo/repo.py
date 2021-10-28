import os
import json
import re
import hashlib

from aim.sdk.configs import get_aim_repo_name
from aim.sdk.utils import clean_repo_path
from aim.cli.upgrade._legacy_repo.repo.utils import get_experiment_run_path
from aim.cli.upgrade._legacy_repo.configs import AIM_CONFIG_FILE_NAME, AIM_COMMIT_INDEX_DIR_NAME


class AimRepo:
    # TODO: Refactor repo to have minimal side effects
    WRITING_MODE = 'w'
    READING_MODE = 'r'

    def __init__(self, path=None, repo_branch=None,
                 repo_commit=None,
                 repo_full_path=None,
                 mode=WRITING_MODE):
        self._config = {}
        path = clean_repo_path(path)
        self.path = repo_full_path or os.path.join(path, get_aim_repo_name())
        self.config_path = os.path.join(self.path, AIM_CONFIG_FILE_NAME)
        self.hash = hashlib.md5(self.path.encode('utf-8')).hexdigest()

        self.active_commit = repo_commit or AIM_COMMIT_INDEX_DIR_NAME
        if re.match(r'^[A-Za-z0-9_\-]{2,}$', self.active_commit) is None:
            raise ValueError('run name must be at least 2 characters ' +
                             'and contain only latin letters, numbers, ' +
                             'dash and underscore')

        self.root_path = repo_full_path or path
        self.name = self.root_path.split(os.sep)[-1]

        self.branch_path = None
        self.index_path = None
        self.objects_dir_path = None
        self.media_dir_path = None
        self.records_storage = None
        self.mode = mode

        active_exp = self.config.get('active_branch')

        if repo_branch is not None:
            experiment = repo_branch
        elif active_exp is not None:
            experiment = active_exp
        else:
            experiment = None

        if experiment is not None:
            run_full_path = get_experiment_run_path(self.path,
                                                    experiment,
                                                    self.active_commit)
        else:
            run_full_path = None

        if self.active_commit != AIM_COMMIT_INDEX_DIR_NAME and run_full_path \
                and os.path.exists(run_full_path):
            raise ValueError(('run `{}` already exists' +
                              '').format(self.active_commit))

    def __str__(self):
        return self.path

    @property
    def config(self):
        """
        Config property getter, loads config file if not already loaded and
        returns json object
        """
        if len(self._config) == 0:
            if os.path.isfile(self.config_path):
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                self._config = config
        return self._config

    def get_records_storage(self, path, mode):
        from aimrecords import Storage
        return Storage(path, mode)

    def list_branches(self) -> list:
        """
        Returns list of existing branches
        """
        if self.config.get('branches') is None:
            return []

        return list(filter(lambda b: b != '',
                           map(lambda b: b.get('name') if b else '',
                               self.config.get('branches'))))

    def list_branch_commits(self, branch):
        """
        Returns list of specified branch commits
        """
        branch_path = os.path.join(self.path, branch.strip())

        commits = []

        if not os.path.isdir(branch_path):
            return commits

        for i in os.listdir(branch_path):
            if os.path.isdir(os.path.join(branch_path, i)) \
                    and i != AIM_COMMIT_INDEX_DIR_NAME:
                commits.append(i)
        return commits
