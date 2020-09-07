import os
import atexit
from typing import Optional, Dict, List

from aim.engine.repo import AimRepo
from aim.artifacts.artifact_writer import ArtifactWriter
from aim.sdk.session.utils import set_automated_env_vars
from aim.artifacts import *
from aim.engine.configs import (
    AIM_BRANCH_ENV_VAR,
    AIM_COMMIT_ENV_VAR,
    AIM_AUTOMATED_EXEC_ENV_VAR,
    AIM_DEFAULT_BRANCH_NAME,
)


class Session:
    sessions: Dict[str, List['Session']] = {}

    def __init__(self, repo_path: Optional[str] = None,
                 experiment_name: Optional[str] = None):
        self.repo = self.get_repo(repo_path, experiment_name)

        # TODO: Add support for multiple sessions
        if len(Session.sessions.keys()) > 0 \
                and self.repo.path not in Session.sessions:
            raise ValueError('multiple sessions are not supported')

        if self.repo.path in Session.sessions:
            Session.sessions[self.repo.path].append(self)
        else:
            Session.sessions[self.repo.path] = [self]

        # Start a new run
        self.open = True
        self.repo.commit_init()

        # Close session
        atexit.register(self.close)

    def __del__(self):
        self.close()

    def close(self):
        if self.open:
            self.open = False

            self.repo.close_records_storage()
            self.repo.commit_finish()

            if self.repo.path in Session.sessions \
                    and self in Session.sessions[self.repo.path]:
                Session.sessions[self.repo.path].remove(self)
                if len(Session.sessions[self.repo.path]) == 0:
                    del Session.sessions[self.repo.path]

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

    @staticmethod
    def get_repo(path: Optional[str] = None,
                 experiment_name: Optional[str] = None) -> AimRepo:
        # Auto commit
        if not os.getenv(AIM_AUTOMATED_EXEC_ENV_VAR):
            init_commit_hash = AimRepo.generate_commit_hash()
            # FIXME: Get active experiment name from given repo
            #  if path is specified. Currently active experiment name of
            #  the highest repo in the hierarchy will be returned.
            if experiment_name is not None:
                init_branch_name = experiment_name
            else:
                init_branch_name = AimRepo.get_active_branch_if_exists() \
                                   or AIM_DEFAULT_BRANCH_NAME
            set_automated_env_vars(init_commit_hash, init_branch_name)

        # Get Aim environment variables
        branch_name = os.getenv(AIM_BRANCH_ENV_VAR)
        commit_hash = os.getenv(AIM_COMMIT_ENV_VAR)

        if path is not None:
            repo = AimRepo(path)
            if not repo.exists():
                if not repo.init():
                    raise ValueError('can not create repo `{}`'.format(path))
            repo = AimRepo(path, branch_name, commit_hash)
        else:
            if AimRepo.get_working_repo() is None:
                path = os.getcwd()
                repo = AimRepo(path)
                if not repo.init():
                    raise ValueError('can not create repo `{}`'.format(path))
                repo = AimRepo(path, branch_name, commit_hash)
            else:
                repo = AimRepo.get_working_repo(branch_name, commit_hash)

        return repo


DefaultSession = Session
