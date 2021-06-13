import os
from pathlib import Path
import json

from aim.engine.repo import AimRepo
from aim.engine.configs import AIM_COMMIT_CONFIG_FILE_NAME

from aim.web.utils import get_root_path
from aim.web.app.commits.utils import TFSummaryAdapter


class Project:
    def __init__(self):
        root_path = get_root_path()
        repo_path = '{}/.aim'.format(root_path)

        self.name = 'My awesome project'
        self.path = root_path
        self.repo_path = repo_path
        self.description = ''
        self.tf_enabled = TFSummaryAdapter.exists()
        self.repo = AimRepo(repo_full_path=repo_path,
                            mode=AimRepo.READING_MODE)

    def exists(self):
        return self.repo and self.repo.exists()

    def get_run_config(self, experiment_name, run_hash):
        config_file_path = os.path.join(self.repo.path,
                                        experiment_name,
                                        run_hash)
        config_file_path = os.path.join(config_file_path,
                                        AIM_COMMIT_CONFIG_FILE_NAME)

        if not os.path.isfile(config_file_path):
            return None

        with open(config_file_path, 'r+') as config_file:
            try:
                configs = json.loads(config_file.read())
            except:
                configs = None

        return configs

    def get_modified_runs(self, last_modified=0):
        updated_runs = {}

        if not self.repo:
            return updated_runs

        experiments = self.repo.list_branches()
        for experiment in experiments:
            runs = self.repo.list_branch_commits(experiment)
            for run in runs:
                run_path = os.path.join(self.repo.path, experiment, run)
                run_config_path = os.path.join(run_path,
                                               AIM_COMMIT_CONFIG_FILE_NAME)

                if not os.path.exists(run_config_path):
                    continue

                run_config_path = Path(run_config_path)
                if not run_config_path or not run_config_path.exists():
                    continue

                run_stats = run_config_path.stat()
                if not run_stats:
                    continue

                modified_time = run_config_path.stat().st_mtime

                if not modified_time or modified_time > last_modified:
                    updated_runs.setdefault(experiment, [])
                    updated_runs[experiment].append((run, modified_time))

        return updated_runs
