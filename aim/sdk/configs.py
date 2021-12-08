import os

AIM_ENABLE_TRACKING_THREAD = '__AIM_ENABLE_TRACKING_THREAD__'
AIM_REPO_NAME = '__AIM_REPO_NAME__'


def get_aim_repo_name():
    return os.environ.get(AIM_REPO_NAME) or '.aim'
