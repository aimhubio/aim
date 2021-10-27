import os
import shutil
import boto3
import tarfile

from aim.sdk.repo import Repo
from aim.web.api.projects.project import Project
from aim.web.utils import exec_cmd
from aim.cli.up.utils import build_db_upgrade_command
from aim.web.configs import AIM_ENV_MODE_KEY

TEST_REPO_PATH = '.aim-performance-repo'

AIM_PERFORMANCE_BUCKET_NAME = 'aim-demo-logs'
AIM_PERFORMANCE_LOG_FILE_NAME = 'performance-logs.tar.gz'


def _init_test_repo():
    if os.path.exists(TEST_REPO_PATH):
        return
    # download the archive
    s3 = boto3.client('s3')
    # needs `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` env variables set up to run locally
    s3.download_file(AIM_PERFORMANCE_BUCKET_NAME, AIM_PERFORMANCE_LOG_FILE_NAME, AIM_PERFORMANCE_LOG_FILE_NAME)
    # extract the archive
    tar = tarfile.open(AIM_PERFORMANCE_LOG_FILE_NAME, "r:gz")
    tar.extractall()
    tar.close()
    # remove the archive
    os.remove(AIM_PERFORMANCE_LOG_FILE_NAME)


def _cleanup_test_repo(path):
    shutil.rmtree(TEST_REPO_PATH)


def _upgrade_api_db():
    db_cmd = build_db_upgrade_command()
    exec_cmd(db_cmd, stream_output=True)


def pytest_sessionstart(session):
    Repo.set_default_path(TEST_REPO_PATH)
    Project.set_repo_path(TEST_REPO_PATH)

    os.environ[AIM_ENV_MODE_KEY] = 'perf-test'

    _init_test_repo()
    _upgrade_api_db()


def pytest_sessionfinish(session, exitstatus):
    _cleanup_test_repo(TEST_REPO_PATH)

    Repo.set_default_path(None)
    Project.set_repo_path(None)
