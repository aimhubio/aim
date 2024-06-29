import unittest

from aim.sdk.repo import Repo
from aim.sdk.run import Run
from aim.web.run import app
from fastapi.testclient import TestClient
from tests.utils import fill_up_test_data, full_class_name, truncate_api_db


class TestBase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        cls.repo = Repo.default_repo()

    def tearDown(self) -> None:
        self.repo.structured_db.invalidate_all_caches()
        self.repo.run_props_cache_hint = None
        super().tearDown()

    @classmethod
    def create_run(cls, **kwargs):
        run = Run(**kwargs)
        run['testcase'] = full_class_name(cls)
        return run

    @classmethod
    def isolated_query_patch(cls, query_str: str = None) -> str:
        if query_str is not None:
            return f'(run.testcase == "{full_class_name(cls)}") and ({query_str})'
        else:
            return f'(run.testcase == "{full_class_name(cls)}")'


class PrefilledDataTestBase(TestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        fill_up_test_data(extra_params={'testcase': full_class_name(cls)})


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
