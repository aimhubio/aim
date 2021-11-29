from parameterized import parameterized

from performance_tests.base import SDKTestBase
from performance_tests.utils import (
    get_baseline,
    write_baseline
)
from performance_tests.sdk.queries import queries
from performance_tests.sdk.utils import (
    collect_runs_data,
    collect_metrics_data
)


class TestDataCollectionExecutionTime(SDKTestBase):
    @parameterized.expand(queries.items())
    def test_collect_runs_data(self, query_key, query):
        query_execution_time = collect_runs_data(query)
        test_name = f'test_collect_runs_data_{query_key}'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertInRange(query_execution_time, baseline)
        else:
            write_baseline(test_name, query_execution_time)

    @parameterized.expand(queries.items())
    def test_collect_metrics_data(self, query_key, query):
        query_execution_time = collect_metrics_data(query)
        test_name = f'test_collect_metrics_data_{query_key}'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertInRange(query_execution_time, baseline)
        else:
            write_baseline(test_name, query_execution_time)
