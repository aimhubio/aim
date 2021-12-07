import unittest
import os

from aim.sdk.configs import AIM_REPO_NAME
from performance_tests.conftest import TEST_REPO_PATHS


class TestBase(unittest.TestCase):
    @staticmethod
    def assertInRange(new, base, deviation=0.05):
        upper_limit = base * (1 + deviation)
        lower_limit = base * (1 - deviation)
        failure_message = f'execution time {new}  is out of allowed range [{lower_limit},{upper_limit}]'
        assert lower_limit <= new <= upper_limit, failure_message


class SDKTestBase(TestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        os.environ[AIM_REPO_NAME] = TEST_REPO_PATHS['real_life_repo']

    @classmethod
    def tearDownClass(cls) -> None:
        del os.environ[AIM_REPO_NAME]
        super().tearDownClass()


class StorageTestBase(TestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        os.environ[AIM_REPO_NAME] = TEST_REPO_PATHS['generated_repo']

    @classmethod
    def tearDownClass(cls) -> None:
        del os.environ[AIM_REPO_NAME]
        super().tearDownClass()
