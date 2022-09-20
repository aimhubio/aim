from parameterized import parameterized

from tests.base import PrefilledDataTestBase
from tests.utils import full_class_name

from aim.sdk.types import QueryReportMode
from aim.storage.query import syntax_error_check


class TestQuery(PrefilledDataTestBase):

    def test_query_metrics(self):
        q = self.isolated_query_patch('run.hparams.batch_size == None and metric.context.is_training == True')

        trace_count = 0
        for trc in self.repo.query_metrics(query=q, report_mode=QueryReportMode.DISABLED):
            self.assertIsNone(trc.run['hparams']['batch_size'])
            self.assertTrue(trc.context['is_training'])
            trace_count += 1
        self.assertEqual(20, trace_count)

    def test_query_metrics_empty_query(self):
        q = self.isolated_query_patch()
        trcs = self.repo.query_metrics(query=q, report_mode=QueryReportMode.DISABLED)
        trace_count = sum(1 for _ in trcs)
        self.assertEqual(40, trace_count)

    def test_query_runs(self):
        q = self.isolated_query_patch('run.hparams.lr < 0.01 and run.run_index >= 5')

        run_count = 0
        for run_trace_collection in self.repo.query_runs(query=q, report_mode=QueryReportMode.DISABLED).iter_runs():
            run = run_trace_collection.run
            self.assertLess(run[('hparams', 'lr')], 0.01)
            self.assertGreaterEqual(run['run_index'], 5)
            run_count += 1
        self.assertEqual(5, run_count)

    def test_query_runs_empty_query(self):
        q = self.isolated_query_patch()
        runs = self.repo.query_runs(query=q, report_mode=QueryReportMode.DISABLED).iter_runs()
        run_count = sum(1 for _ in runs)
        self.assertEqual(10, run_count)

    def test_query_run_structured_params(self):
        q = self.isolated_query_patch('run.name == "Run # 2"')
        run_count = 0
        for run_trace_collection in self.repo.query_runs(query=q, report_mode=QueryReportMode.DISABLED).iter_runs():
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
        q = self.isolated_query_patch(q)
        for _ in self.repo.query_metrics(q, report_mode=QueryReportMode.DISABLED):
            continue
        for _ in self.repo.query_runs(q, report_mode=QueryReportMode.DISABLED).iter_runs():
            continue

    def test_invalid_query(self):
        q = self.isolated_query_patch('invalid_varialble.get("hparams", "batch_size") == None')
        with self.assertRaises(Exception):
            next(iter(self.repo.query_metrics(q, report_mode=QueryReportMode.DISABLED)))

    def test_query_raise_syntax_error(self):
        q = self.isolated_query_patch('run.hash == "x" && metric.name == "y"')
        with self.assertRaises(SyntaxError):
            next(iter(self.repo.query_metrics(q, report_mode=QueryReportMode.DISABLED)))

        with self.assertRaises(SyntaxError):
            next(iter(self.repo.query_runs(q, report_mode=QueryReportMode.DISABLED)))

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
        self.run = next((run for run in self.repo.iter_runs() if run.get('testcase') == full_class_name(self.__class__)))
        self.run.archived = True
        self.run_hash = self.run.hash

    def tearDown(self):
        self.run.archived = False

    def test_default_query_run_results(self):
        run_hashes = [run.run.hash for run in self.repo.query_runs(report_mode=QueryReportMode.DISABLED).iter_runs()]
        self.assertNotIn(self.run_hash, run_hashes)

    def test_default_query_metric_results(self):
        run_hashes = [metric.run.hash for metric in self.repo.query_metrics(report_mode=QueryReportMode.DISABLED)]
        self.assertNotIn(self.run_hash, run_hashes)

    def test_query_with_archived_expression_run_results(self):
        q = self.isolated_query_patch('run.archived == True')
        run_hashes = []
        for run in self.repo.query_runs(query=q, report_mode=QueryReportMode.DISABLED).iter_runs():
            run_hashes.append(run.run.hash)
            self.assertTrue(run.run.archived)
        self.assertIn(self.run_hash, run_hashes)

    def test_query_without_archived_expression_metric_results(self):
        q = self.isolated_query_patch('metric.name == "accuracy"')
        run_hashes = []
        for metric in self.repo.query_metrics(query=q, report_mode=QueryReportMode.DISABLED):
            run_hashes.append(metric.run.hash)
            self.assertFalse(metric.run.archived)
        self.assertNotIn(self.run_hash, run_hashes)
