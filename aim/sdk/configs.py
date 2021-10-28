import os

AIM_ENABLE_TRACKING_THREAD = '__AIM_ENABLE_TRACKING_THREAD__'


def get_aim_repo_name():
    return os.environ.get('__AIM_REPO_NAME__') or '.aim'
