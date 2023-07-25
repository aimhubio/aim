import os

from typing import Tuple

AIM_REPO_NAME = '__AIM_REPO_NAME__'
AIM_RUN_INDEXING_TIMEOUT = '__AIM_RUN_INDEXING_TIMEOUT_SECONDS__'
AIM_LOG_LEVEL_KEY = '__AIM_LOG_LEVEL__'
AIM_ENV_MODE_KEY = '__AIM_ENV_MODE__'


def get_aim_repo_name() -> str:
    return os.environ.get(AIM_REPO_NAME) or '.aim'


def get_data_version() -> Tuple[int, int]:
    return 2, 0
