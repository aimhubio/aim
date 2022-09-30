import pytz

from tests.base import PrefilledDataApiTestBase, ApiTestBase
from tests.utils import generate_image_set

from parameterized import parameterized
import datetime

from aim.sdk.run import Run


class TestProjectApi(PrefilledDataApiTestBase):
    def test_project_activity_api(self):
        with self.repo.structured_db as db:
            db.create_experiment('My experiment')

        experiment_count = len(self.repo.structured_db.experiments())
        run_count = len(self.repo.structured_db.runs())
        client = self.client
        response = client.get('/api/projects/activity')
        self.assertEqual(200, response.status_code)
        data = response.json()
        today_gmt = datetime.datetime.now().astimezone(pytz.timezone('gmt')).strftime('%Y-%m-%dT%H:00:00')
        self.assertEqual(run_count, data['num_runs'])
        self.assertEqual(run_count, data['activity_map'][today_gmt])
        self.assertEqual(experiment_count, data['num_experiments'])  # count 'default' experiment

    def test_project_params_api(self):
        client = self.client
        response = client.get('/api/projects/params')
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertIn('params', data)
        self.assertIn('metric', data)
        self.assertIn('images', data)
        self.assertEqual({}, data['images'])
        self.assertSetEqual({'accuracy', 'loss'}, set(data['metric']))
        self.assertIn('hparams', data['params'])
        self.assertIn('batch_size', data['params']['hparams'])
        self.assertIn('lr', data['params']['hparams'])
        self.assertIn('name', data['params'])
        self.assertIn('run_index', data['params'])
        self.assertIn('start_time', data['params'])


class TestProjectParamsWithImagesApi(ApiTestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        run1 = Run(system_tracking_interval=None)
        run1.track(1., name='metric1', context={'a': True})
        run1.track(generate_image_set(1), name='images1', context={'a': True})
        run1.track(generate_image_set(1), name='images1', context={'b': True})

        run2 = Run(system_tracking_interval=None)
        run2.track(1, name='metric2', context={'a': True})
        run2.track(generate_image_set(1)[0], name='images2', context={'b': True})

    @parameterized.expand([
        ({'sequence': ('metric', 'images')},),  # metrics only
        (None,)                                 # default
    ])
    def test_project_images_and_metric_info_api(self, qparams):
        client = self.client
        response = client.get('/api/projects/params', params=qparams)
        self.assertEqual(200, response.status_code)
        data = response.json()

        self.assertIn('metric', data)
        self.assertIn('images', data)

        self.assertTrue({'metric1', 'metric2'}.issubset(set(data['metric'].keys())))
        self.assertTrue({'images1', 'images2'}.issubset(set(data['images'].keys())))

        self.assertEqual(1, len(data['metric']['metric1']))
        self.assertDictEqual({'a': 1}, data['metric']['metric1'][0])

        self.assertEqual(2, len(data['images']['images1']))

        self.assertEqual(1, len(data['metric']['metric2']))
        self.assertDictEqual({'a': 1}, data['metric']['metric2'][0])

        self.assertEqual(1, len(data['images']['images2']))
        self.assertDictEqual({'b': 1}, data['images']['images2'][0])

    def test_project_images_info_only_api(self):
        client = self.client
        response = client.get('/api/projects/params', params={'sequence': 'images'})
        self.assertEqual(200, response.status_code)
        data = response.json()

        self.assertNotIn('metric', data)
        self.assertIn('images', data)

    def test_project_metric_info_only_api(self):
        client = self.client
        response = client.get('/api/projects/params', params={'sequence': 'metric'})
        self.assertEqual(200, response.status_code)
        data = response.json()

        self.assertIn('metric', data)
        self.assertNotIn('images', data)

    def test_invalid_sequence_type(self):
        client = self.client
        response = client.get('/api/projects/params', params={'sequence': 'non-existing-sequence'})
        self.assertEqual(400, response.status_code)
