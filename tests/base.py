import unittest
from fastapi.testclient import TestClient

from tests.utils import truncate_api_db, fill_up_test_data, remove_test_data
from aim.sdk.repo import Repo

from aim.web.run import app


class TestBase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        cls.repo = Repo.default_repo()

    @classmethod
    def tearDownClass(cls) -> None:
        remove_test_data()
        super().tearDownClass()

    def tearDown(self) -> None:
        self.repo.structured_db.invalidate_all_caches()
        self.repo.run_props_cache_hint = None
        super().tearDown()


class PrefilledDataTestBase(TestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        fill_up_test_data()


class ApiTestBase(TestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls) -> None:
        truncate_api_db()
        super().tearDownClass()


class PrefilledDataApiTestBase(ApiTestBase, PrefilledDataTestBase):
    pass
