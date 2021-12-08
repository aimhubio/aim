import os
import shutil

from aim.sdk.repo import Repo, _get_tracking_queue
from aim.web.utils import exec_cmd
from aim.cli.up.utils import build_db_upgrade_command
from aim.web.configs import AIM_ENV_MODE_KEY
from aim.sdk.configs import AIM_ENABLE_TRACKING_THREAD, AIM_REPO_NAME

TEST_REPO_PATH = '.aim-test-repo'


def _init_test_repo():
    repo = Repo.default_repo(init=True)
    # some unittests check sequence tracking in a separate thread
    # need to make sure task_queue is there
    os.environ[AIM_ENABLE_TRACKING_THREAD] = 'ON'
    Repo.tracking_queue = _get_tracking_queue()
    del os.environ[AIM_ENABLE_TRACKING_THREAD]


def _cleanup_test_repo(path):
    shutil.rmtree(TEST_REPO_PATH)


def _upgrade_api_db():
    db_cmd = build_db_upgrade_command()
    exec_cmd(db_cmd, stream_output=True)


def pytest_sessionstart(session):
    os.environ[AIM_REPO_NAME] = TEST_REPO_PATH
    os.environ[AIM_ENV_MODE_KEY] = 'test'

    _init_test_repo()
    _upgrade_api_db()


def pytest_sessionfinish(session, exitstatus):
    _cleanup_test_repo(TEST_REPO_PATH)
    del os.environ[AIM_REPO_NAME]
