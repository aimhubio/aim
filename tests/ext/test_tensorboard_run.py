import time

from aim.ext.resource.log import LogLine
from aim.ext.tensorboard_tracker.run import Run as TensorboardRun

from tests.base import TestBase
from tests.utils import full_class_name


class TestTensorboardRun(TestBase):

    def test_tensorboard_tracker_run__default_no_capture(self):
        # Given
        run = TensorboardRun(sync_tensorboard_log_dir="dummy", repo=self.repo)
        run['testcase'] = full_class_name(TensorboardRun)
        run_hash = run.hash
        console_statement = 'no console capture is being done'

        # When
        print(console_statement)
        time.sleep(3)  # allow tracker to add resource usage metrics
        del run

        # Then
        runs = self.repo.query_runs(f'run.hash == "{run_hash}"')
        first_run = list(runs.iter_runs())[0]
        self.assertIsNone(first_run.dataframe())

    def test_tensorboard_tracker_run__system_stats_captured(self):
        # Given
        run = TensorboardRun(
            sync_tensorboard_log_dir="dummy", repo=self.repo, system_tracking_interval=1
        )
        run['testcase'] = full_class_name(TensorboardRun)
        run_hash = run.hash

        # When
        time.sleep(3)  # allow tracker to add resource usage metrics
        del run

        # Then
        metrics = self.repo.query_metrics(f'run.hash == "{run_hash}"')
        first_run = list(metrics.iter_runs())[0]
        metrics_recorded = set(first_run.dataframe()['metric.name'].unique())
        self.assertTrue("__system__cpu" in metrics_recorded)

    def test_tensorboard_tracker_run__terminal_capture(self):
        # Given
        run = TensorboardRun(
            sync_tensorboard_log_dir="dummy", repo=self.repo, capture_terminal_logs=True,
        )
        run['testcase'] = full_class_name(TensorboardRun)
        run_hash = run.hash
        console_statement = 'no console capture has worked'

        # When
        print(console_statement)
        time.sleep(3)  # allow tracker to add terminal logs
        del run

        # Then
        runs = self.repo.query_runs(f'run.hash == "{run_hash}"')
        first_run = list(runs.iter_runs())[0]
        terminal_logs = first_run.run.get_terminal_logs()
        log_found = False
        for log_item in terminal_logs.data.values():
            log_line = log_item[0][0]
            if isinstance(log_line, LogLine):
                if console_statement in str(log_line.data):
                    log_found = True

        self.assertTrue(log_found)

    def test_tensorboard_tracker_run__system_params_captured(self):
        # Given
        run = TensorboardRun(
            sync_tensorboard_log_dir="dummy", repo=self.repo, log_system_params=True
        )
        run['testcase'] = full_class_name(TensorboardRun)
        run_hash = run.hash

        # When
        time.sleep(3)  # allow tracker to add system params
        del run

        # Then
        runs = self.repo.query_runs(f'run.hash == "{run_hash}"')
        first_run = list(runs.iter_runs())[0]
        system_params = first_run.run.get('__system_params')
        self.assertIsNotNone(system_params)
