import os
import shutil

from aim.sdk.repo import Repo
from aim.web.utils import exec_cmd
from aim.cli.up.utils import build_db_upgrade_command
from aim.web.configs import AIM_ENV_MODE_KEY

TEST_REPO_PATH = '.aim-test-repo'


def _init_test_repo():
    repo = Repo.default_repo(init=True)


def _cleanup_test_repo(path):
    shutil.rmtree(TEST_REPO_PATH)


def _upgrade_api_db():
    db_cmd = build_db_upgrade_command()
    exec_cmd(db_cmd, stream_output=True)


def pytest_sessionstart(session):
    os.environ['__AIM_REPO_NAME__'] = TEST_REPO_PATH
    os.environ[AIM_ENV_MODE_KEY] = 'test'

    _init_test_repo()
    _upgrade_api_db()


def pytest_sessionfinish(session, exitstatus):
    _cleanup_test_repo(TEST_REPO_PATH)
    del os.environ['__AIM_REPO_NAME__']
