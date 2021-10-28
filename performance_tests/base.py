import unittest
from fastapi.testclient import TestClient

from tests.utils import truncate_api_db

from aim.web.run import app


class TestBase(unittest.TestCase):
    @staticmethod
    def assertInRange(new, base):
        upper_limit = base * 1.10
        lower_limit = base * 0.85
        failure_message = f'execution time {new}  is out of allowed range [{lower_limit},{upper_limit}]'
        assert lower_limit <= new <= upper_limit, failure_message


class ApiTestBase(TestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls) -> None:
        truncate_api_db()
        super().tearDownClass()
