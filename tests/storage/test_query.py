from parameterized import parameterized

from tests.base import PrefilledDataTestBase

from aim.storage.query import syntax_error_check


class TestQuery(PrefilledDataTestBase):

    def test_query_metrics(self):
        q = 'run.hparams.batch_size == None and metric.context.is_training == True'
        trace_count = 0
        for trc in self.repo.query_metrics(query=q):
            self.assertIsNone(trc.run['hparams']['batch_size'])
            self.assertTrue(trc.context['is_training'])
            trace_count += 1
        self.assertEqual(20, trace_count)

    def test_query_metrics_empty_query(self):
        q = ''
        trcs = self.repo.query_metrics(query=q)
        trace_count = sum(1 for _ in trcs)
        self.assertEqual(40, trace_count)

    def test_query_runs(self):
        q = 'run.hparams.lr < 0.01 and run.run_index >= 5'

        run_count = 0
        for run_trace_collection in self.repo.query_runs(query=q).iter_runs():
            run = run_trace_collection.run
            self.assertLess(run[('hparams', 'lr')], 0.01)
            self.assertGreaterEqual(run['run_index'], 5)
            run_count += 1
        self.assertEqual(5, run_count)

    def test_query_runs_empty_query(self):
        q = ''
        runs = self.repo.query_runs(query=q).iter_runs()
        run_count = sum(1 for _ in runs)
        self.assertEqual(10, run_count)

    def test_query_run_structured_params(self):
        q = 'run.name == "Run # 2"'
        run_count = 0
        for run_trace_collection in self.repo.query_runs(query=q).iter_runs():
            run = run_trace_collection.run
            self.assertEqual("Run # 2", run.name)
            run_count += 1
        self.assertEqual(1, run_count)

    @parameterized.expand([
        ('run + context', 'run.hparams.batch_size == None and metric.context.is_training == True'),
        ('run multiple filters', 'run.hparams.batch_size == None and run.hparams.lr == 0.01'),
        ('context only', 'metric.context["is_training"] == False'),
        ('context + metric name', 'metric.context.is_training == False and metric.name == "loss"'),
        ('__getitem__ interface with tuple', 'run["hparams","lr"] == 0.01'),
        ('__getitem__ interface chaining', 'run["hparams"]["lr"] == 0.01'),
        ('mixed interface', 'run["hparams"].lr == 0.01'),
    ])
    def test_query_execution(self, name, q):
        # crash/no-crash test
        # execute query and iterate over result
        for _ in self.repo.query_metrics(q):
            continue
        for _ in self.repo.query_runs(q).iter_runs():
            continue

    def test_invalid_query(self):
        q = 'invalid_varialble.get("hparams", "batch_size") == None'
        with self.assertRaises(Exception):
            next(iter(self.repo.query_metrics(q)))

    def test_query_raise_syntax_error(self):
        q = 'run.hash == "x" && metric.name == "y"'
        with self.assertRaises(SyntaxError):
            next(iter(self.repo.query_metrics(q)))

        with self.assertRaises(SyntaxError):
            next(iter(self.repo.query_runs(q)))

    def test_syntax_error_handling(self):
        q = 'run.hash == "x" && metric.name == "y"'
        try:
            syntax_error_check(q)
        except SyntaxError as se:
            self.assertEqual(19, se.offset)  # count for added ()
            self.assertEqual(1, se.lineno)
        else:
            self.fail('SyntaxError is not raised')


class TestQueryDefaultExpression(PrefilledDataTestBase):
    def setUp(self):
        self.run = next(self.repo.iter_runs())
        self.run.archived = True
        self.run_hash = self.run.hash

    def tearDown(self):
        self.run.archived = False

    def test_default_query_run_results(self):
        run_hashes = [run.run.hash for run in self.repo.query_runs().iter_runs()]
        self.assertNotIn(self.run_hash, run_hashes)

    def test_default_query_metric_results(self):
        run_hashes = [metric.run.hash for metric in self.repo.query_metrics()]
        self.assertNotIn(self.run_hash, run_hashes)

    def test_query_with_archived_expression_run_results(self):
        q = 'run.archived == True'
        run_hashes = []
        for run in self.repo.query_runs(query=q).iter_runs():
            run_hashes.append(run.run.hash)
            self.assertTrue(run.run.archived)
        self.assertIn(self.run_hash, run_hashes)

    def test_query_without_archived_expression_metric_results(self):
        q = 'metric.name == "accuracy"'
        run_hashes = []
        for metric in self.repo.query_metrics(query=q):
            run_hashes.append(metric.run.hash)
            self.assertFalse(metric.run.archived)
        self.assertNotIn(self.run_hash, run_hashes)
