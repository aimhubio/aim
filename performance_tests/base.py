import unittest
from fastapi.testclient import TestClient

from tests.utils import truncate_api_db
from aim.sdk.repo import Repo

from aim.web.run import app


class TestBase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.repo = Repo.default_repo()

    def tearDown(self) -> None:
        self.repo.structured_db.invalidate_all_caches()
        self.repo.run_props_cache_hint = None

    @staticmethod
    def assertInRange(new, base, max_deviation=0.05):
        deviation = 1 - new/base
        failure_message = f'new value: {new} \n' \
                          f'baseline: {base} \n' \
                          f'deviation: {deviation} \n' \
                          f'expected max deviation: {max_deviation}'
        assert deviation <= max_deviation, failure_message
        assert deviation >= -max_deviation, failure_message


class ApiTestBase(TestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls) -> None:
        truncate_api_db()
        super().tearDownClass()
