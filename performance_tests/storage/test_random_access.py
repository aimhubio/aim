from aim import Repo
from parameterized import parameterized
from performance_tests.base import StorageTestBase
from performance_tests.storage.utils import random_access_metric_values
from performance_tests.utils import get_baseline, write_baseline


class TestRandomAccess(StorageTestBase):
    @parameterized.expand({0: 50, 1: 250, 2: 500}.items())
    def test_random_access(self, test_key, density):
        test_name = f'test_random_access_{test_key}'
        repo = Repo.default_repo()
        query = 'metric.name == "metric 0"'
        execution_time = random_access_metric_values(repo, query, density)
        baseline = get_baseline(test_name)
        if baseline:
            self.assertInRange(execution_time, baseline)
        else:
            write_baseline(test_name, execution_time)
