import os
import time

from aim.sdk.utils import set_automated_env_vars
from aim.engine.repo import AimRepo
from aim.engine.configs import (
    AIM_BRANCH_ENV_VAR,
    AIM_COMMIT_ENV_VAR,
    AIM_AUTOMATED_EXEC_ENV_VAR,
    AIM_DEFAULT_BRANCH_NAME,
)


def init(overwrite=False, autocommit=True):
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
