import os
import uuid
import time

from aim.engine.aim_repo import AimRepo
from aim.engine.configs import (
    AIM_BRANCH_ENV_VAR,
    AIM_COMMIT_ENV_VAR,
    AIM_AUTOMATED_EXEC_ENV_VAR,
)


def init(overwrite=False):
    # Get ENV VARS
    branch_name = os.getenv(AIM_BRANCH_ENV_VAR)
    commit_hash = os.getenv(AIM_COMMIT_ENV_VAR)
    automated_exec = os.getenv(AIM_AUTOMATED_EXEC_ENV_VAR)

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
                repo.commit(str(uuid.uuid1()), int(time.time()))
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
