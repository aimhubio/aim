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


class ApiTestBase(TestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls) -> None:
        truncate_api_db()
        super().tearDownClass()
