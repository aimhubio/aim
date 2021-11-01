import unittest
from fastapi.testclient import TestClient

from aim.web.run import app


class TestBase(unittest.TestCase):
    @staticmethod
    def assertInRange(new, base, deviation=0.05):
        upper_limit = base * (1 + deviation)
        lower_limit = base * (1 - deviation)
        failure_message = f'execution time {new}  is out of allowed range [{lower_limit},{upper_limit}]'
        assert lower_limit <= new <= upper_limit, failure_message


class ApiTestBase(TestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls) -> None:
        super().tearDownClass()
