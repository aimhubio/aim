from tests.base import PrefilledDataApiTestBase
from tests.utils import fill_up_test_data, remove_test_data


class StructuredApiTestBase(PrefilledDataApiTestBase):
    def setUp(self) -> None:
        super().setUp()
        fill_up_test_data()
        with self.repo.structured_db:
            for idx, run in enumerate(self.repo.iter_runs()):
                exp_name = 'Experiment 1' if idx < 5 else 'Experiment 2'

                run.name = f'Run number {idx + 1}'
                run.experiment = exp_name
                if idx < 3:
                    run.add_tag('first runs')
                elif 3 <= idx < 7:
                    run.add_tag('first runs')
                    run.add_tag('last runs')
                else:
                    run.add_tag('last runs')

    def tearDown(self) -> None:
        remove_test_data()
        super().tearDown()


class TestStructuredRunApi(StructuredApiTestBase):
    def test_set_run_experiment_api(self):
        matching_runs = self.repo.structured_db.search_runs('Run number 3')
        run = next(iter(matching_runs))
        self.assertEqual('Experiment 1', run.experiment)

        client = self.client
        # set existing experiment
        resp = client.put(f'/api/runs/{run.hash}', json={'experiment': 'Experiment 2'})
        self.assertEqual(200, resp.status_code)
        self.assertEqual('Experiment 2', run.experiment)

        # set non-existing experiment (create new)
        resp = client.put(f'/api/runs/{run.hash}', json={'experiment': 'New experiment'})
        self.assertEqual(200, resp.status_code)
        self.assertEqual('New experiment', run.experiment)

    def test_add_remove_tag_api(self):
        matching_runs = self.repo.structured_db.search_runs('Run number 5')
        run = next(iter(matching_runs))
        tags = [tag for tag in run.tags_obj]
        self.assertEqual(2, len(run.tags_obj))

        self.assertListEqual(['first runs', 'last runs'], run.tags)

        client = self.client
        # remove tag # 1
        resp = client.delete(f'/api/runs/{run.hash}/tags/{tags[0].uuid}')
        self.assertEqual(200, resp.status_code)
        self.assertEqual(1, len(run.tags))
        self.assertListEqual(['last runs'], run.tags)

        # add new tag
        resp = client.post(f'/api/runs/{run.hash}/tags/new', json={'tag_name': 'new tag'})
        self.assertEqual(200, resp.status_code)
        self.assertEqual(2, len(run.tags))
        self.assertListEqual(['last runs', 'new tag'], run.tags)

    def test_update_run_name_description(self):
        matching_runs = self.repo.structured_db.search_runs('Run number 3')
        run = next(iter(matching_runs))
        client = self.client
        resp = client.put(f'/api/runs/{run.hash}', json={'description': 'long text', 'name': 'best run'})
        self.assertEqual(200, resp.status_code)
        self.assertEqual('best run', run.name)
        self.assertEqual('long text', run.description)


class TestTagsApi(StructuredApiTestBase):
    def test_list_tags_api(self):
        client = self.client
        response = client.get('/api/tags')
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual(2, len(data))

    def test_search_tags_api(self):
        client = self.client
        response = client.get('/api/tags/search', params={'q': 'runs'})
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual(2, len(data))

        response = client.get('/api/tags/search', params={'q': 'last'})
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual(1, len(data))

    def test_get_tag_api(self):
        client = self.client
        response = client.get('/api/tags/search', params={'q': 'last runs'})
        self.assertEqual(200, response.status_code)
        data = response.json()

        tag_uuid = data[0]['id']
        response = client.get(f'/api/tags/{tag_uuid}')
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual('last runs', data['name'])
        self.assertEqual(None, data['color'])
        self.assertFalse(data['archived'])

    def test_create_tag_api(self):
        client = self.client
        response = client.post('/api/tags/', json={'name': 'my awesome tag'})
        self.assertEqual(200, response.status_code)
        data = response.json()
        tag_uuid = data['id']
        new_tag = self.repo.structured_db.find_tag(tag_uuid)
        self.assertEqual('my awesome tag', new_tag.name)

    def test_update_tag_props_api(self):
        tag = next(iter(self.repo.structured_db.tags()))
        self.assertEqual(None, tag.color)
        client = self.client
        response = client.put(f'/api/tags/{tag.uuid}/', json={'name': 'my awesome tag',
                                                              'color': '#FFFFFF',
                                                              'description': 'new description'})
        self.assertEqual(200, response.status_code)
        self.assertEqual('my awesome tag', tag.name)
        self.assertEqual('#FFFFFF', tag.color)
        self.assertEqual('new description', tag.description)

    def test_get_tag_runs_api(self):
        client = self.client
        response = client.get('/api/tags/search', params={'q': 'last runs'})
        self.assertEqual(200, response.status_code)
        data = response.json()

        tag_uuid = data[0]['id']
        response = client.get(f'/api/tags/{tag_uuid}/runs/')
        self.assertEqual(200, response.status_code)
        data = response.json()
        run_names = {run['name'] for run in data['runs']}
        expected_run_names = {f'Run number {i}' for i in range(4, 11)}
        self.assertSetEqual(expected_run_names, run_names)
        self.assertTrue(all('end_time' in run for run in data['runs']))

    def test_archive_tag_api(self):
        tag = next(iter(self.repo.structured_db.tags()))
        client = self.client
        response = client.put(f'/api/tags/{tag.uuid}/', json={'archived': True})
        self.assertEqual(200, response.status_code)
        self.assertTrue(tag.archived)

    def test_delete_tag_api(self):
        tag = next(iter(self.repo.structured_db.tags()))
        client = self.client
        delete_response = client.delete(f'/api/tags/{tag.uuid}/')
        self.assertEqual(200, delete_response.status_code)
        get_response = client.delete(f'/api/tags/{tag.uuid}/')
        self.assertEqual(404, get_response.status_code)

    def test_list_run_tags_with_archived_tag(self):
        tag = next(iter(self.repo.structured_db.tags()))
        self.assertTrue(all(tag in r.tags for r in tag.runs))
        client = self.client
        response = client.put(f'/api/tags/{tag.uuid}/', json={'archived': True})
        self.assertEqual(200, response.status_code)
        self.assertFalse(any(tag in r.tags for r in tag.runs))


class TestExperimentsApi(StructuredApiTestBase):
    def test_list_experiments_api(self):
        client = self.client
        response = client.get('/api/experiments')
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual(3, len(data))  # count default experiment

    def test_search_experiments_api(self):
        client = self.client
        response = client.get('/api/experiments/search', params={'q': 'Exp'})
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual(2, len(data))

        response = client.get('/api/experiments/search', params={'q': 'Experiment 2'})
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual(1, len(data))

    def test_get_experiment_api(self):
        client = self.client
        response = client.get('/api/experiments/search', params={'q': 'Experiment 2'})
        self.assertEqual(200, response.status_code)
        data = response.json()

        exp_uuid = data[0]['id']
        response = client.get(f'/api/experiments/{exp_uuid}')
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual('Experiment 2', data['name'])

    def test_create_experiment_api(self):
        client = self.client
        response = client.post('/api/experiments/', json={'name': 'New experiment'})
        self.assertEqual(200, response.status_code)
        data = response.json()
        exp_uuid = data['id']
        exp = self.repo.structured_db.find_experiment(exp_uuid)
        self.assertEqual('New experiment', exp.name)

    def test_update_experiment_props_api(self):
        exp = next(iter(self.repo.structured_db.experiments()))
        client = self.client
        response = client.put(f'/api/experiments/{exp.uuid}/', json={'name': 'Updated experiment'})
        self.assertEqual(200, response.status_code)
        self.assertEqual('Updated experiment', exp.name)

    def test_get_experiment_runs_api(self):
        client = self.client
        response = client.get('/api/experiments/search', params={'q': 'Experiment 2'})
        self.assertEqual(200, response.status_code)
        data = response.json()

        exp_uuid = data[0]['id']
        response = client.get(f'/api/experiments/{exp_uuid}/runs/')
        self.assertEqual(200, response.status_code)
        data = response.json()
        run_names = {run['name'] for run in data['runs']}
        expected_run_names = {f'Run number {i}' for i in range(6, 11)}
        self.assertSetEqual(expected_run_names, run_names)

    def test_get_experiment_runs_paginated_api(self):
        client = self.client
        response = client.get('/api/experiments/search', params={'q': 'Experiment 2'})
        data = response.json()

        exp_uuid = data[0]['id']
        response = client.get(f'/api/experiments/{exp_uuid}/runs/', params={'limit': 2})
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual(2, len(data['runs']))

        offset = data['runs'][-1]['run_id']

        response = client.get(f'/api/experiments/{exp_uuid}/runs/', params={'limit': 5, 'offset': offset})
        self.assertEqual(200, response.status_code)
        data = response.json()
        run_ids = {run['run_id'] for run in data['runs']}
        self.assertNotIn(offset, run_ids)
        self.assertEqual(3, len(data['runs']))

    def test_archive_experiment_with_runs(self):
        client = self.client
        response = client.get('/api/experiments/search', params={'q': 'Experiment 2'})
        self.assertEqual(200, response.status_code)
        data = response.json()
        exp_uuid = data[0]['id']

        response = client.put(f'/api/experiments/{exp_uuid}/', json={'archived': True})
        self.assertEqual(response.status_code, 400)
        error_msg = f'Cannot archive experiment \'{exp_uuid}\'. Experiment has associated runs.'
        self.assertEqual(response.json()['message'], error_msg)
