import boto3
import os
import shutil
import tarfile
import time
from pathlib import Path

from aim.sdk.configs import AIM_REPO_NAME
from performance_tests.utils import get_baseline_filename

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
    if os.environ.get('AIM_LOCAL_PERFORMANCE_TEST'):
        _init_test_repos()
    else:
        # github actions performance tests on self hosted runner
        os.chdir('/home/ubuntu/performance_logs/')
    time.sleep(10)

def print_current_baseline():
    print('==== CURRENT BASELINE ====')
    with open(get_baseline_filename(), 'r') as f:
        print(f.read())
    print('==========================')

def pytest_unconfigure(config):
    print_current_baseline()

def pytest_sessionfinish(session, exitstatus):
    if os.environ.get('AIM_LOCAL_PERFORMANCE_TEST'):
        for path in TEST_REPO_PATHS.values():
            _cleanup_test_repo(path)
    if os.environ.get(AIM_REPO_NAME):
        del os.environ[AIM_REPO_NAME]
