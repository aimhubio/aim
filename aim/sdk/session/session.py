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

    def __init__(self, repo: Optional[str] = None,
                 experiment: Optional[str] = None):
        self.active = False

        self.repo = self.get_repo(repo, experiment)

        Session.sessions.setdefault(self.repo.path, [])
        Session.sessions[self.repo.path].append(self)

        # Start a new run
        self.repo.commit_init()

        self.active = True

        # Finalize run
        atexit.register(self.close)

    def __del__(self):
        self.close()

    def close(self):
        if self.active:
            self.active = False
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
        inst = obj(*args, **kwargs, aim_session_id=id(self))

        writer = ArtifactWriter()
        writer.save(self.repo, inst)

        return inst

    def set_params(self, params: dict, name: Optional[str] = None):
        return self.track(params, namespace=name)

    @staticmethod
    def get_repo(path: Optional[str] = None,
                 experiment_name: Optional[str] = None) -> AimRepo:
        # Auto commit
        if os.getenv(AIM_AUTOMATED_EXEC_ENV_VAR):
            # Get Aim environment variables
            branch_name = os.getenv(AIM_BRANCH_ENV_VAR)
            commit_hash = os.getenv(AIM_COMMIT_ENV_VAR)
        else:
            commit_hash = AimRepo.generate_commit_hash()
            if experiment_name is not None:
                branch_name = experiment_name
            else:
                # FIXME: Get active experiment name from given repo
                #  if path is specified. Currently active experiment name of
                #  the highest repo in the hierarchy will be returned.
                branch_name = AimRepo.get_active_branch_if_exists() \
                              or AIM_DEFAULT_BRANCH_NAME

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
