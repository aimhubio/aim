import pytest

from tests.base import TestBase

from aim.sdk import Repo
from aim.storage.context import Context


class TestRunMetricNumpyTypes(TestBase):
    @pytest.mark.gh_2256
    def test_run_get_metrics(self):
        """covers https://github.com/aimhubio/aim/issues/2256"""
        run = self.create_run(system_tracking_interval=None)
        run_hash = run.hash
        run.track(1.0, name='metric 1', context={})
        run.track(1.0, name='metric 2', context={'metric': 2})
        run.close()

        repo = Repo.default_repo()
        run = repo.get_run(run_hash)
        metric_names = set()
        metric_contexts = set()
        for metric in run.metrics():
            metric_names.add(metric.name)
            metric_contexts.add(metric.context.idx)

        expected_metrics = {'metric 1', 'metric 2'}
        expected_contexts = {Context({}).idx, Context({'metric': 2}).idx}
        self.assertSetEqual(expected_metrics, metric_names)
        self.assertSetEqual(expected_contexts, metric_contexts)
