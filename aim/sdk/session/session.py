import os
import time
from typing import Optional

from aim.engine.repo import AimRepo
from aim.artifacts.artifact_writer import ArtifactWriter
from aim.sdk import metric, dictionary
from aim.sdk.session.utils import set_automated_env_vars
from aim.engine.configs import (
    AIM_BRANCH_ENV_VAR,
    AIM_COMMIT_ENV_VAR,
    AIM_AUTOMATED_EXEC_ENV_VAR,
    AIM_DEFAULT_BRANCH_NAME,
)


class Session:
    sessions = []

    def __init__(self, repo: Optional[AimRepo] = None):
        if repo is None:
            # Get ENV VARS
            branch_name = os.getenv(AIM_BRANCH_ENV_VAR)
            commit_hash = os.getenv(AIM_COMMIT_ENV_VAR)
            # Get aim repo from working directory
            repo = AimRepo.get_working_repo(branch_name, commit_hash)

            # if repo is not None:
            #     atexit.register(repo.close_records_storage)

        self.repo = repo

        Session.sessions.append(self)

    def __del__(self):
        self.repo.close_records_storage()

    def track(self, *args, **kwargs):
        if self.repo is None:
            raise FileNotFoundError('Aim repository was not found')

        artifact_name = None

        if not len(args):
            print('Artifact is not specified')

        if isinstance(args[0], str):
            artifact_name = args[0]
        elif isinstance(args[0], int) or isinstance(args[0], float):
            # Autodetect Metric artifact
            artifact_name = metric
            kwargs['value'] = args[0]
            args = []
        elif isinstance(args[0], dict):
            # Autodetect Dictionary(Map) artifact
            artifact_name = dictionary
            kwargs['value'] = args[0]
            args = []

        if artifact_name is None or artifact_name not in globals():
            print('Aim cannot track: \'{0}\''.format(artifact_name))
            return

        # Get corresponding class
        obj = globals()[artifact_name]

        # Create an instance
        inst = obj(*args, **kwargs)

        writer = ArtifactWriter()
        writer.save(self.repo, inst)

        return inst

    def set_params(self, params: dict, name: Optional[str] = None):
        return self.track(params, namespace=name)

    @classmethod
    def init(cls, overwrite=False, autocommit=True):
        # Automated commit
        automated_exec = os.getenv(AIM_AUTOMATED_EXEC_ENV_VAR)
        if autocommit and not automated_exec:
            automated_exec = True
            init_commit_hash = AimRepo.generate_commit_hash()
            init_branch_name = AimRepo.get_active_branch_if_exists() \
                               or AIM_DEFAULT_BRANCH_NAME
            set_automated_env_vars(init_commit_hash, init_branch_name)

        # Get Aim environment variables
        branch_name = os.getenv(AIM_BRANCH_ENV_VAR)
        commit_hash = os.getenv(AIM_COMMIT_ENV_VAR)

        # Init repo if doesn't exist and return repo instance
        repo = AimRepo.get_working_repo(branch_name, commit_hash)
        if not repo:
            repo = AimRepo(os.getcwd(), branch_name, commit_hash)
            repo.init()

        if not automated_exec:
            # Check if repo index is empty or not
            # Reset index or commit according to `overwrite` argument
            if not repo.is_index_empty():
                if overwrite:
                    repo.reset_index()
                else:
                    repo.commit(AimRepo.generate_commit_hash(),
                                int(time.time()))
        else:
            # TODO: handle automated training overwrite
            pass

        # Handle aim commit
        if automated_exec:
            # Init commit
            repo.commit_init()

            # Finish commit
            import atexit
            atexit.register(repo.commit_finish)
