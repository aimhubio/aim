from parameterized import parameterized
from performance_tests.base import TestBase
from performance_tests.utils import (
    collect_runs_data,
    collect_metrics_data,
    get_baseline,
    write_baseline
)
from performance_tests.queries import queries


class TestRunDataCollectionExecutionTime(TestBase):
    @parameterized.expand(queries.items())
    def test_collect_runs_data(self, query_key, query):
        query_execution_time = collect_runs_data(self.repo, query)
        test_name = f'test_collect_runs_data_{query_key}'
        assert False, f'{test_name} {query_execution_time}'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertInRange(query_execution_time, baseline)
        else:
            write_baseline(test_name, query_execution_time)


class TestMetricDataCollectionExecutionTime(TestBase):
    @parameterized.expand(queries.items())
    def test_collect_metrics_data(self, query_key, query):
        query_execution_time = collect_metrics_data(self.repo, query)
        test_name = f'test_collect_metrics_data_{query_key}'
        assert False, f'{test_name} {query_execution_time}'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertInRange(query_execution_time, baseline)
        else:
            write_baseline(test_name, query_execution_time)
