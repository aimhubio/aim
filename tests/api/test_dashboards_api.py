from tests.base import PrefilledDataApiTestBase


class TestDashboardAppsApi(PrefilledDataApiTestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        for _ in range(5):
            cls.client.post('/api/apps/', json={'type': 'metric_explorer', 'state': {}})

    def test_list_apps_api(self):
        response = self.client.get('/api/apps/')
        self.assertEqual(5, len(response.json()))

    def test_get_app_api(self):
        list_response = self.client.get('/api/apps/')
        app_id = list_response.json()[0]['id']
        response = self.client.get(f'/api/apps/{app_id}/')
        data = response.json()
        self.assertEqual(200, response.status_code)
        self.assertEqual(app_id, data['id'])
        self.assertEqual('metric_explorer', data['type'])
        self.assertEqual({}, data['state'])

    def test_update_app_api(self):
        list_response = self.client.get('/api/apps/')
        app_id = list_response.json()[0]['id']
        response = self.client.put(f'/api/apps/{app_id}/', json={'type': 'params_explorer', 'state': {'foo': 'bar'}})
        self.assertEqual(response.status_code, 200)
        get_response = self.client.get(f'/api/apps/{app_id}/')
        data = get_response.json()
        self.assertEqual('params_explorer', data['type'])
        self.assertEqual('bar', data['state']['foo'])

    def test_delete_app_api(self):
        list_response = self.client.get('/api/apps/')
        app_id = list_response.json()[0]['id']
        response = self.client.delete(f'/api/apps/{app_id}/')
        self.assertEqual(200, response.status_code)
        get_response = self.client.get(f'/api/apps/{app_id}/')
        self.assertEqual(404, get_response.status_code)

    def test_create_app_api(self):
        app_data = {'state': {'test_key1': 'test_value', 'test_key2': [1, 2, 3]},
                    'type': 'metric_explorer'}
        response = self.client.post('/api/apps/', json=app_data)
        self.assertEqual(201, response.status_code)
        app_id = response.json()['id']
        get_response = self.client.get(f'/api/apps/{app_id}/')
        data = get_response.json()
        self.assertEqual(app_id, data['id'])
        self.assertDictEqual(app_data['state'], data['state'])
        self.assertEqual(app_data['type'], data['type'])


class TestDashboardsApi(PrefilledDataApiTestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        app_data = {"type": "metric_explorer", "state": {}}
        response = cls.client.post('/api/apps/', json=app_data)
        cls.app_id = response.json()['id']
        for i in range(5):
            cls.client.post('/api/dashboards/', json={'name': f'dashboard_{i}'})

    def test_list_dashboards_api(self):
        response = self.client.get('/api/dashboards/')
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual(5, len(data))

    def test_get_dashboard_api(self):
        list_response = self.client.get('/api/dashboards/')
        list_data = list_response.json()
        dashboard_id = list_data[0]['id']
        dashboard_name = list_data[0]['name']
        response = self.client.get(f'/api/dashboards/{dashboard_id}/')
        self.assertEqual(200, response.status_code)
        data = response.json()
        self.assertEqual(dashboard_id, data['id'])
        self.assertEqual(dashboard_name, data['name'])

    def test_update_dashboard_api(self):
        list_response = self.client.get('/api/dashboards/')
        list_data = list_response.json()
        dashboard_id = list_data[0]['id']
        response = self.client.put(f'/api/dashboards/{dashboard_id}', json={'description': 'new description'})
        self.assertEqual(200, response.status_code)

        get_response = self.client.get(f'/api/dashboards/{dashboard_id}')
        data = get_response.json()
        self.assertEqual('new description', data['description'])

    def test_create_dashboard_api(self):
        response = self.client.post('/api/dashboards/', json={'name': 'awesome',
                                                              'description': 'pretty awesome dashboard',
                                                              'app_id': self.app_id})
        self.assertEqual(201, response.status_code)
        dashboard_id = response.json()['id']
        get_response = self.client.get(f'/api/dashboards/{dashboard_id}/')
        data = get_response.json()
        self.assertEqual(dashboard_id, data['id'])
        self.assertEqual('awesome', data['name'])
        self.assertEqual('pretty awesome dashboard', data['description'])
        self.assertEqual(self.app_id, data['app_id'])

    def test_delete_dashboard_api(self):
        list_response = self.client.get('/api/dashboards/')
        list_data = list_response.json()
        dashboard_id = list_data[0]['id']
        response = self.client.delete(f'/api/dashboards/{dashboard_id}/')
        self.assertEqual(200, response.status_code)
        get_response = self.client.get(f'/api/dashboards/{dashboard_id}/')
        self.assertEqual(404, get_response.status_code)
