import boto3
import os
import shutil
import tarfile
import time
from pathlib import Path

from aim.web.utils import exec_cmd
from aim.cli.up.utils import build_db_upgrade_command
from aim.web.configs import AIM_ENV_MODE_KEY

TEST_REPO_PATHS = {
    'real_life_repo': '.aim_performance_repo_1',
    'generated_repo': '.aim_performance_repo_2'
}
AIM_PERFORMANCE_BUCKET_NAME = 'aim-demo-logs'
AIM_PERFORMANCE_LOG_FILE_NAME = 'performance-logs.tar.gz'


def _init_test_repos():
    for repo_path in TEST_REPO_PATHS.values():
        if os.path.exists(repo_path):
            _cleanup_test_repo(repo_path)

    tarfile_name = f'data/{AIM_PERFORMANCE_LOG_FILE_NAME}'
    # download the archive
    if not os.path.exists(tarfile_name):
        Path('data').mkdir(exist_ok=True)
        s3 = boto3.client('s3')
        # needs `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` env variables set up to run locally
        s3.download_file(AIM_PERFORMANCE_BUCKET_NAME,
                         AIM_PERFORMANCE_LOG_FILE_NAME,
                         tarfile_name)
    # extract the archive
    tar = tarfile.open(tarfile_name, 'r:gz')
    tar.extractall()
    tar.close()


def _cleanup_test_repo(path):
    shutil.rmtree(path)


def pytest_sessionstart(session):
    _init_test_repos()
    time.sleep(5)


def pytest_sessionfinish(session, exitstatus):
    for path in TEST_REPO_PATHS.values():
        _cleanup_test_repo(path)
    if os.environ.get('__AIM_REPO_NAME__'):
        del os.environ['__AIM_REPO_NAME__']
