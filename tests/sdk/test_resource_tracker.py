import time

from aim.sdk import Run
from aim.sdk.types import QueryReportMode
from tests.base import TestBase


class TestRunResourceTracker(TestBase):
    def test_default_tracking_interval(self):
        run = Run()  # default tracking interval 10s
        run_hash = run.hash
        run.track(1, name='metric')
        time.sleep(0.1)  # allow tracker to add resource usage metrics
        del run

        metrics = list(
            self.repo.query_metrics(
                f'run.hash == "{run_hash}" and metric.name.startswith("__")', report_mode=QueryReportMode.DISABLED
            )
        )
        expected_metrics = {
            '__system__cpu',
            '__system__disk_percent',
            '__system__memory_percent',
            '__system__p_memory_percent',
        }
        metric_names = set(m.name for m in metrics)
        for name in expected_metrics:
            self.assertIn(name, metric_names)

    def test_custom_tracking_interval(self):
        run = Run(system_tracking_interval=1)
        run_hash = run.hash
        run.track(1, name='metric')
        time.sleep(3)  # allow tracker to add resource usage metrics
        del run

        metrics = list(
            self.repo.query_metrics(
                f'run.hash == "{run_hash}" and metric.name.startswith("__")', report_mode=QueryReportMode.DISABLED
            )
        )
        expected_metrics = {
            '__system__cpu',
            '__system__disk_percent',
            '__system__memory_percent',
            '__system__p_memory_percent',
        }
        metric_names = set(m.name for m in metrics)
        for name in expected_metrics:
            self.assertIn(name, metric_names)
        for metric in metrics:
            # 3 sec. runtime, 1 sec. interval
            self.assertGreaterEqual(len(metric.data.indices_list()), 3)
            self.assertLessEqual(len(metric.data.indices_list()), 4)

    def test_disable_resource_tracking(self):
        run = Run(system_tracking_interval=None)
        run_hash = run.hash
        run.track(1, name='metric')
        time.sleep(0.1)  # allow tracker to add resource usage metrics
        del run

        metrics = list(
            self.repo.query_metrics(
                f'run.hash == "{run_hash}" and metric.name.startswith("__")', report_mode=QueryReportMode.DISABLED
            )
        )
        self.assertListEqual([], metrics)

    def test_resource_tracking_interval_limits(self):
        run = Run(system_tracking_interval=0, capture_terminal_logs=False)
        self.assertIsNone(run._system_resource_tracker)
        run = Run(system_tracking_interval=2 * 24 * 3600, capture_terminal_logs=False)  # two days
        self.assertIsNone(run._system_resource_tracker)
