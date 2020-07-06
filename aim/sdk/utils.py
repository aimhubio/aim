import os

from aim.engine.configs import (
    AIM_BRANCH_ENV_VAR,
    AIM_COMMIT_ENV_VAR,
    AIM_AUTOMATED_EXEC_ENV_VAR,
)


def set_automated_env_vars(commit_hash, branch_name):
    os.environ[AIM_AUTOMATED_EXEC_ENV_VAR] = '1'
    os.environ[AIM_COMMIT_ENV_VAR] = commit_hash
    os.environ[AIM_BRANCH_ENV_VAR] = branch_name
