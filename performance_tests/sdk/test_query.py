from performance_tests.base import TestBase
from performance_tests.utils import (
    query_runs,
    query_metrics,
    get_baseline,
    write_baseline,
    check_in_range
)
from performance_tests.queries import query_1, query_2, query_3, query_4


class TestQueryRunsExecutionTime(TestBase):
    def test_query_runs_1(self):
        query_execution_time = query_runs(self.repo, query_1)
        test_name = 'test_query_runs_1'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)

    def test_query_runs_2(self):
        query_execution_time = query_runs(self.repo, query_2)
        test_name = 'test_query_runs_2'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)

    def test_query_runs_3(self):
        query_execution_time = query_runs(self.repo, query_3)
        test_name = 'test_query_runs_3'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)

    def test_query_runs_4(self):
        query_execution_time = query_runs(self.repo, query_4)
        test_name = 'test_query_runs_4'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)


class TestQueryMetricsExecutionTime(TestBase):
    def test_query_metrics_1(self):
        query_execution_time = query_metrics(self.repo, query_1)
        test_name = 'test_query_metrics_1'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)

    def test_query_metrics_2(self):
        query_execution_time = query_metrics(self.repo, query_2)
        test_name = 'test_query_metrics_2'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)

    def test_query_metrics_3(self):
        query_execution_time = query_metrics(self.repo, query_3)
        test_name = 'test_query_metrics_3'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)

    def test_query_metrics_4(self):
        query_execution_time = query_metrics(self.repo, query_4)
        test_name = 'test_query_metrics_4'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)
