from parameterized import parameterized

from aim import Repo
from aim.storage.context import Context

from performance_tests.base import StorageTestBase
from performance_tests.utils import get_baseline, write_baseline
from performance_tests.storage.utils import random_access_metric_values


class TestDBOpen(StorageTestBase):
    @parameterized.expand({0: 10, 1: 100, 2: 1000}.items())
    def test_random_access(self, test_key, density):
        test_name = f'test_random_access_{test_key}'
        repo = Repo.default_repo()
        run = next(repo.iter_runs())
        metric = run.get_metric('metric 0', Context({}))
        execution_time = random_access_metric_values(metric, density)
        baseline = get_baseline(test_name)
        if baseline:
            self.assertInRange(execution_time, baseline)
        else:
            write_baseline(test_name, execution_time)
