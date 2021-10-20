import sqlite3
import time

from tests.base import TestBase

from aim.sdk.run import Run


class TestRunFinalizedAt(TestBase):
    def setUp(self):
        db_path = self.repo.structured_db.path + '/run_metadata.sqlite'
        self.sqlite_conn = sqlite3.connect(db_path)

    def _query_run_finalized_at(self, run_hash):
        query = 'SELECT finalized_at FROM run WHERE hash=:run_hash'
        cursor = self.sqlite_conn.cursor()
        cursor.execute(query, {'run_hash': run_hash})
        return cursor.fetchone()[0]
        # run = self.repo.structured_db.find_run(run_hash)
        # return run.finalized_at

    def test_implicit_run_delete(self):
        run_hash = []

        def _func():
            run = Run(system_tracking_interval=None)
            run_hash.append(run.hash)
            self.assertIsNone(run.finalized_at)
            self.assertIsNone(self._query_run_finalized_at(run_hash[0]))
            for i in range(10):
                run.track(i, name='seq')
            self.assertIsNone(run.finalized_at)
            self.assertIsNone(self._query_run_finalized_at(run_hash[0]))

        _func()

        time.sleep(.1)  # wait for tracking queue and gc to collect the run object
        self.assertIsNotNone(self._query_run_finalized_at(run_hash[0]))

    def test_explicit_run_delete(self):
        run = Run(system_tracking_interval=None)
        run_hash = run.hash
        for i in range(10):
            run.track(i, name='seq')
        time.sleep(.1)  # wait for tracking queue and gc to collect the run object
        del run
        self.assertIsNotNone(self._query_run_finalized_at(run_hash))

    def test_explicit_run_finalize(self):
        run = Run(system_tracking_interval=None)
        run_hash = run.hash
        for i in range(10):
            run.track(i, name='seq')
        run.finalize()
        self.assertIsNotNone(self._query_run_finalized_at(run_hash))
