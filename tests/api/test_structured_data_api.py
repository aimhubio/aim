import uuid

from tests.base import PrefilledDataApiTestBase


class TestStructuredRunApi(PrefilledDataApiTestBase):
    def setUp(self) -> None:
        super().setUp()

        self.test_id = str(uuid.uuid4())
        with self.repo.structured_db:
            for idx, run in zip(range(10), self.repo.iter_runs()):
                exp_name = f'Experiment 1 {self.test_id}' if idx < 5 else f'Experiment 2 {self.test_id}'

                run.name = f'Run number {idx + 1} {self.test_id}'
                run.experiment = exp_name
                if idx < 3:
                    run.add_tag(f'first runs {self.test_id}')
                elif 3 <= idx < 7:
                    run.add_tag(f'first runs {self.test_id}')
                    run.add_tag(f'last runs {self.test_id}')
                else:
                    run.add_tag(f'last runs {self.test_id}')

    # runs API
    def test_set_run_experiment_api(self):
        matching_runs = self.repo.structured_db.search_runs(f'Run number 3 {self.test_id}')
        run = next(iter(matching_runs))
        self.assertEqual(f'Experiment 1 {self.test_id}', run.experiment)

        client = self.client
        # set existing experiment
        resp = client.put(f'/api/runs/{run.hash}', json={'experiment': f'Experiment 2 {self.test_id}'})
        self.assertEqual(200, resp.status_code)

        resp = client.get(f'/api/runs/{run.hash}/info').json()
        self.assertEqual(f'Experiment 2 {self.test_id}', resp['props']['experiment']['name'])

        # set non-existing experiment (create new)
        resp = client.put(f'/api/runs/{run.hash}', json={'experiment': f'New experiment {self.test_id}'})
        self.assertEqual(200, resp.status_code)
        resp = client.get(f'/api/runs/{run.hash}/info').json()
        self.assertEqual(f'New experiment {self.test_id}', resp['props']['experiment']['name'])

    def test_add_remove_tag_api(self):
        matching_runs = self.repo.structured_db.search_runs(f'Run number 5 {self.test_id}')
        run = next(iter(matching_runs))
        tags = [tag for tag in run.tags_obj]
        self.assertEqual(2, len(run.tags_obj))

        self.assertListEqual([f'first runs {self.test_id}', f'last runs {self.test_id}'], run.tags)

        client = self.client
        # remove tag # 1
        resp = client.delete(f'/api/runs/{run.hash}/tags/{tags[0].uuid}')
        self.assertEqual(200, resp.status_code)

        resp = client.get(f'/api/runs/{run.hash}/info/').json()
        self.assertEqual(1, len(resp['props']['tags']))
        tag_names = [tag['name'] for tag in resp['props']['tags']]
        self.assertListEqual([f'last runs {self.test_id}'], tag_names)

        # add new tag
        resp = client.post(f'/api/runs/{run.hash}/tags/new', json={'tag_name': f'new tag {self.test_id}'})
        self.assertEqual(200, resp.status_code)

        resp = client.get(f'/api/runs/{run.hash}/info/').json()
        self.assertEqual(2, len(resp['props']['tags']))
        tag_names = [tag['name'] for tag in resp['props']['tags']]
        self.assertListEqual([f'last runs {self.test_id}', f'new tag {self.test_id}'], tag_names)

    def test_update_run_name_description(self):
        matching_runs = self.repo.structured_db.search_runs('Run number 3')
        run = next(iter(matching_runs))
        client = self.client
        resp = client.put(f'/api/runs/{run.hash}', json={'description': f'long text {self.test_id}',
                                                         'name': f'best run {self.test_id}'})
        self.assertEqual(200, resp.status_code)

        resp = client.get(f'/api/runs/{run.hash}/info/').json()
        self.assertEqual(f'best run {self.test_id}', resp['props']['name'])
        self.assertEqual(f'long text {self.test_id}', resp['props']['description'])

    # tags API
    def test_list_tags_api(self):
        client = self.client
        response = client.get('/api/tags')
        self.assertEqual(200, response.status_code)
        data = response.json()
        test_tags = [tag for tag in data if tag['name'].endswith(self.test_id)]
        self.assertEqual(2, len(test_tags))

    def test_search_tags_api(self):
        client = self.client
        response = client.get('/api/tags/search', params={'q': self.test_id})
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual(2, len(data))

        response = client.get('/api/tags/search', params={'q': f'last runs {self.test_id}'})
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual(1, len(data))

    def test_get_tag_api(self):
        client = self.client
        response = client.get('/api/tags/search', params={'q': f'last runs {self.test_id}'})
        self.assertEqual(200, response.status_code)
        data = response.json()

        tag_uuid = data[0]['id']
        response = client.get(f'/api/tags/{tag_uuid}')
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual(f'last runs {self.test_id}', data['name'])
        self.assertEqual(None, data['color'])
        self.assertFalse(data['archived'])

    def test_create_tag_api(self):
        client = self.client
        response = client.post('/api/tags/', json={'name': f'my awesome tag {self.test_id}'})
        self.assertEqual(200, response.status_code)
        data = response.json()
        tag_uuid = data['id']
        new_tag = self.repo.structured_db.find_tag(tag_uuid)
        self.assertEqual(f'my awesome tag {self.test_id}', new_tag.name)

    def test_update_tag_props_api(self):
        tag = next(iter(self.repo.structured_db.tags()))
        self.assertEqual(None, tag.color)
        client = self.client
        response = client.put(f'/api/tags/{tag.uuid}/', json={'name': 'my awesome tag',
                                                              'color': '#FFFFFF',
                                                              'description': 'new description'})
        self.assertEqual(200, response.status_code)

        response = client.get(f'/api/tags/{tag.uuid}/').json()
        self.assertEqual('my awesome tag', response['name'])
        self.assertEqual('#FFFFFF', response['color'])
        self.assertEqual('new description', response['description'])

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
        expected_run_names = {f'Run number {i} {self.test_id}' for i in range(4, 11)}
        self.assertSetEqual(expected_run_names, run_names)
        self.assertTrue(all('end_time' in run for run in data['runs']))

    def test_archive_tag_api(self):
        tag = next(iter(self.repo.structured_db.tags()))
        client = self.client
        response = client.put(f'/api/tags/{tag.uuid}/', json={'archived': True})
        self.assertEqual(200, response.status_code)

        response = client.get(f'/api/tags/{tag.uuid}/').json()
        self.assertTrue(response['archived'])

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
        for run in tag.runs:
            response = client.get(f'/api/runs/{run.hash}/info/').json()
            tag_names = [tag['name'] for tag in response['props']['tags']]
            self.assertFalse(tag.name in tag_names)

    # experiments API
    def test_list_experiments_api(self):
        client = self.client
        response = client.get('/api/experiments')
        self.assertEqual(200, response.status_code)
        data = response.json()
        test_experiments = [exp for exp in data if exp['name'].endswith(self.test_id)]
        self.assertEqual(2, len(test_experiments))  # count default experiment
        default_experiment = next((exp for exp in data if exp['name'] == 'default'), None)
        self.assertIsNotNone(default_experiment)

    def test_search_experiments_api(self):
        client = self.client
        response = client.get('/api/experiments/search', params={'q': f'{self.test_id}'})
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual(2, len(data))

        response = client.get('/api/experiments/search', params={'q': f'Experiment 2 {self.test_id}'})
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual(1, len(data))

    def test_get_experiment_api(self):
        client = self.client
        response = client.get('/api/experiments/search', params={'q': f'Experiment 2 {self.test_id}'})
        self.assertEqual(200, response.status_code)
        data = response.json()

        exp_uuid = data[0]['id']
        response = client.get(f'/api/experiments/{exp_uuid}')
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual(f'Experiment 2 {self.test_id}', data['name'])

    def test_create_experiment_api(self):
        client = self.client
        response = client.post('/api/experiments/', json={'name': f'New experiment {self.test_id}'})
        self.assertEqual(200, response.status_code)
        data = response.json()
        exp_uuid = data['id']
        exp = self.repo.structured_db.find_experiment(exp_uuid)
        self.assertEqual(f'New experiment {self.test_id}', exp.name)

    def test_update_experiment_props_api(self):
        exp = next(iter(self.repo.structured_db.experiments()))
        client = self.client
        response = client.put(f'/api/experiments/{exp.uuid}/', json={'name': 'Updated experiment'})
        self.assertEqual(200, response.status_code)

        response = client.get(f'/api/experiments/{exp.uuid}/').json()
        self.assertEqual('Updated experiment', response['name'])

    def test_get_experiment_runs_api(self):
        client = self.client
        response = client.get('/api/experiments/search', params={'q': f'Experiment 2 {self.test_id}'})
        self.assertEqual(200, response.status_code)
        data = response.json()

        exp_uuid = data[0]['id']
        response = client.get(f'/api/experiments/{exp_uuid}/runs/')
        self.assertEqual(200, response.status_code)
        data = response.json()
        run_names = {run['name'] for run in data['runs']}
        expected_run_names = {f'Run number {i} {self.test_id}' for i in range(6, 11)}
        self.assertSetEqual(expected_run_names, run_names)

    def test_get_experiment_runs_paginated_api(self):
        client = self.client
        response = client.get('/api/experiments/search', params={'q': f'Experiment 2 {self.test_id}'})
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
        response = client.get('/api/experiments/search', params={'q': f'Experiment 2 {self.test_id}'})
        self.assertEqual(200, response.status_code)
        data = response.json()
        exp_uuid = data[0]['id']

        response = client.put(f'/api/experiments/{exp_uuid}/', json={'archived': True})
        self.assertEqual(response.status_code, 400)
        error_msg = f'Cannot archive experiment \'{exp_uuid}\'. Experiment has associated runs.'
        self.assertEqual(response.json()['message'], error_msg)
