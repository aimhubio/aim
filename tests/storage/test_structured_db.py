from tests.base import PrefilledDataTestBase

from aim.sdk.utils import generate_run_hash

class TestStructuredDatabase(PrefilledDataTestBase):
    def test_entity_chaining_syntax(self):
        run = self.repo.structured_db.find_run('missing_run_hash')
        self.assertFalse(run.experiment)
        self.assertFalse(run.experiment.name)
        self.assertFalse(run.tags)
        self.assertFalse(run.name)
        self.assertFalse(run.description)

    def test_entity_relations(self):
        with self.repo.structured_db as db:
            db.create_experiment('my experiment')
            runs = [db.create_run(generate_run_hash()) for _ in range(10)]
            for run in runs:
                run.experiment = 'my experiment'

        for run in runs:
            self.assertEqual('my experiment', run.experiment_obj.name)
            self.assertEqual(10, len(run.experiment_obj.runs))

    def test_context_manager_nesting(self):
        with self.repo.structured_db as db1:
            with self.repo.structured_db as db2:
                db1.create_experiment('exp 1')
                db2.create_experiment('exp 2')

        experiment_names = set((exp.name for exp in self.repo.structured_db.experiments()))
        expected_names = set(('exp 1', 'exp 2'))
        self.assertTrue(experiment_names.issuperset(expected_names))
