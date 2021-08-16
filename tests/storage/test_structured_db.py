from tests.base import TestBase


class TestStructuredDatabase(TestBase):
    def test_entity_chaining_syntax(self):
        run = self.repo.structured_db.find_run('missing_run_hashname')
        self.assertFalse(run.experiment)
        self.assertFalse(run.experiment.name)
        self.assertFalse(run.tags)
        self.assertFalse(run.name)
        self.assertFalse(run.description)

    def test_entity_relations(self):
        with self.repo.structured_db as db:
            db.create_experiment('my experiment')
            for run in db.runs():
                run.experiment = 'my experiment'

            for run in db.runs():
                self.assertEqual('my experiment', run.experiment.name)
                self.assertEqual(10, len(run.experiment.runs))
