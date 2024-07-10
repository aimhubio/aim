import random

import numpy as np

from aim.sdk.repo import Run
from aim.sdk.types import QueryReportMode
from tests.base import TestBase


class TestTrack(TestBase):
    def test_query_metrics_default_epoch(self):
        run = Run(repo=self.repo, system_tracking_interval=None, capture_terminal_logs=False)
        for i in range(10):
            run.track(random.random(), name='epoch_none')
            run.track(random.random(), name='with_epoch', epoch=i)
            run.track(random.random(), name='with_epoch_and_step', step=i, epoch=i)

        q = 'metric.name == "epoch_none"'

        trace_count = 0
        for trc in self.repo.query_metrics(query=q, report_mode=QueryReportMode.DISABLED):
            trace_count += 1
            for epoch in trc.epochs.values_numpy():
                self.assertTrue(np.isnan(epoch))
            steps, epochs = trc.epochs.sparse_numpy()
            for epoch in epochs:
                self.assertTrue(np.isnan(epoch))
        self.assertEqual(1, trace_count)

        # crash/no-crash test for mixed queries
        q = 'metric.name == "epoch_none" or metric.name == "with_epoch"'
        for trc in self.repo.query_metrics(query=q, report_mode=QueryReportMode.DISABLED):
            trc.epochs.sparse_numpy()
            trc.epochs.values_numpy()
        q = ''
        for trc in self.repo.query_metrics(query=q, report_mode=QueryReportMode.DISABLED):
            trc.epochs.sparse_numpy()
            trc.epochs.values_numpy()
