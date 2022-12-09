import pytest
import numpy as np

from tests.base import TestBase

from aim.sdk import Repo, Run
from aim.sdk.types import QueryReportMode


class TestRunMetricNumpyTypes(TestBase):
    @pytest.mark.gh_1206
    def test_numpy_scalar_types_track(self):
        """covers https://github.com/aimhubio/aim/issues/1206"""

        run = self.create_run(system_tracking_interval=None)
        run.track(np.array([1.0]), name='single_item_array')
        run.track(np.array([[[1.0]]]), name='single_item_3d_array')
        run.track(np.float64(1.0), name='numpy_float64')
        run.track(np.float32(1.0), name='numpy_float32')
        run.close()

        repo = Repo.default_repo()
        q = self.isolated_query_patch()
        metric_names = {metric.name for metric in repo.query_metrics(query=q, report_mode=QueryReportMode.DISABLED)}
        expected_metric_names = {'single_item_array', 'single_item_3d_array', 'numpy_float64', 'numpy_float32'}
        self.assertSetEqual(expected_metric_names, metric_names)

    def test_reject_non_scalar_arrays_track(self):
        run = Run(system_tracking_interval=None)
        with self.assertRaises(ValueError):
            run.track(np.array([1.0, 2.0]), name='fail')
