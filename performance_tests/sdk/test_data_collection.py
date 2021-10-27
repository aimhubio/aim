from performance_tests.base import TestBase
from performance_tests.utils import (
    collect_runs_data,
    collect_metrics_data,
    get_baseline,
    write_baseline,
    check_in_range
)
from performance_tests.queries import query_1, query_2, query_3, query_4


class TestRunDataCollectionExecutionTime(TestBase):
    def test_collect_runs_data_1(self):
        query_execution_time = collect_runs_data(self.repo, query_1)
        test_name = 'test_collect_runs_data_1'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)

    def test_collect_runs_data_2(self):
        query_execution_time = collect_runs_data(self.repo, query_2)
        test_name = 'test_collect_runs_data_2'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)

    def test_collect_runs_data_3(self):
        query_execution_time = collect_runs_data(self.repo, query_3)
        test_name = 'test_collect_runs_data_3'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)

    def test_collect_runs_data_4(self):
        query_execution_time = collect_runs_data(self.repo, query_4)
        test_name = 'test_collect_runs_data_4'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)


class TestMetricDataCollectionExecutionTime(TestBase):
    def test_collect_metrics_data_1(self):
        query_execution_time = collect_metrics_data(self.repo, query_1)
        test_name = 'test_collect_metrics_data_1'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)

    def test_collect_metrics_data_2(self):
        query_execution_time = collect_metrics_data(self.repo, query_2)
        test_name = 'test_collect_metrics_data_2'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)

    def test_collect_metrics_data_3(self):
        query_execution_time = collect_metrics_data(self.repo, query_3)
        test_name = 'test_collect_metrics_data_3'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)

    def test_collect_metrics_data_4(self):
        query_execution_time = collect_metrics_data(self.repo, query_4)
        test_name = 'test_collect_metrics_data_4'
        baseline = get_baseline(test_name)
        if baseline:
            self.assertTrue(check_in_range(baseline, query_execution_time))
        else:
            write_baseline(test_name, query_execution_time)
