import os
import shutil

from aim.sdk.repo import Repo
from aim.web.api.projects.project import Project
from aim.web.utils import exec_cmd
from aim.cli.up.utils import build_db_upgrade_command
from aim.web.configs import AIM_WEB_ENV_KEY

TEST_REPO_PATH = '.aim-test-repo'


def _init_test_repo():
    repo = Repo.default_repo(init=True)
    repo.structured_db.run_upgrades()


def _cleanup_test_repo(path):
    shutil.rmtree(TEST_REPO_PATH)


def _upgrade_api_db():
    db_cmd = build_db_upgrade_command()
    exec_cmd(db_cmd, stream_output=True)


def pytest_sessionstart(session):
    Repo.set_default_path(TEST_REPO_PATH)
    Project.set_repo_path(TEST_REPO_PATH)

    _init_test_repo()
    os.environ[AIM_WEB_ENV_KEY] = 'test'
    _upgrade_api_db()


def pytest_sessionfinish(session, exitstatus):
    _cleanup_test_repo(TEST_REPO_PATH)

    Repo.set_default_path(None)
    Project.set_repo_path(None)
