import os
from functools import wraps

from aim.engine.configs import (
    AIM_BRANCH_ENV_VAR,
    AIM_COMMIT_ENV_VAR,
    AIM_AUTOMATED_EXEC_ENV_VAR,
)


def set_automated_env_vars(commit_hash, branch_name):
    os.environ[AIM_AUTOMATED_EXEC_ENV_VAR] = '1'
    os.environ[AIM_COMMIT_ENV_VAR] = commit_hash
    os.environ[AIM_BRANCH_ENV_VAR] = branch_name


def exception_resistant(func):
    num_fails = 0
    max_fails = 6

    @wraps(func)
    def wrapper(*args, **kwargs):
        nonlocal num_fails
        func_name = func.__name__
        try:
            return func(*args, **kwargs)
        except Exception as e:
            num_fails += 1
            if num_fails == 1:
                print(('Something went wrong in `{}`. ' +
                       'The process will continue to ' +
                       'execute.').format(func_name))
            if num_fails <= max_fails:
                print('`{}`: {}'.format(func_name, e))
            elif num_fails == max_fails + 1:
                print(('The rest of the `{}` errors ' +
                       'are hidden.').format(func_name))
    return wrapper
