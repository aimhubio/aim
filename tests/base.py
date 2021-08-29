import unittest
from fastapi.testclient import TestClient

from tests.utils import truncate_api_db, fill_up_test_data, remove_test_data
from aim.sdk.repo import Repo
from aim.sdk.run import Run

from aim.web.run import app


class TestBase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        fill_up_test_data()
        cls.repo = Repo.default_repo()

    @classmethod
    def tearDownClass(cls) -> None:
        remove_test_data()

    def tearDown(self) -> None:
        self.repo.structured_db.invalidate_caches()
        Run.set_props_cache_hint(None)


class ApiTestBase(TestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls) -> None:
        truncate_api_db()
        super().tearDownClass()
