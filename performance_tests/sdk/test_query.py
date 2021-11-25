from parameterized import parameterized

from performance_tests.base import SDKTestBase
from performance_tests.utils import (
    get_baseline,
    write_baseline
)
from performance_tests.sdk.queries import queries
from performance_tests.sdk.utils import (
    query_runs,
    query_metrics
)


class TestQueryExecutionTime(SDKTestBase):
    @parameterized.expand(queries.items())
    def test_query_runs(self, query_key, query):
        query_execution_time = query_runs(query)
        test_name = f'test_query_runs_{query_key}'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertInRange(query_execution_time, baseline)
        else:
            write_baseline(test_name, query_execution_time)

    @parameterized.expand(queries.items())
    def test_query_metrics(self, query_key, query):
        query_execution_time = query_metrics(query)
        test_name = f'test_query_metrics_{query_key}'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertInRange(query_execution_time, baseline)
        else:
            write_baseline(test_name, query_execution_time)
