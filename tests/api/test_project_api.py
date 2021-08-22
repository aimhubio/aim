from tests.base import ApiTestBase
import datetime


class TestProjectApi(ApiTestBase):
    def test_project_activity_api(self):
        with self.repo.structured_db as db:
            db.create_experiment('My experiment')

        client = self.client
        response = client.get('/api/projects/activity')
        self.assertEqual(200, response.status_code)
        data = response.json()
        today = datetime.date.today().isoformat()
        self.assertEqual(10, data['num_runs'])
        self.assertEqual(10, data['activity_map'][today])
        self.assertEqual(2, data['num_experiments'])  # count 'default' experiment

    def test_project_params_api(self):
        client = self.client
        response = client.get('/api/projects/params')
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertIn('params', data)
        self.assertIn('metrics', data)
        self.assertSetEqual({'accuracy', 'loss'}, set(data['metrics']))
        self.assertIn('hparams', data['params'])
        self.assertIn('batch_size', data['params']['hparams'])
        self.assertIn('lr', data['params']['hparams'])
        self.assertIn('name', data['params'])
        self.assertIn('run_index', data['params'])
        self.assertIn('start_time', data['params'])
