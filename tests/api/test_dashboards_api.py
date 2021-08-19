from tests.base import ApiTestBase
from .examples import (
    example_request_es_json,
    example_response_es_json,
    incorrect_es_json,
    empty_es_json
)


class TestDashboardAppsApi(ApiTestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        for _ in range(5):
            cls.client.post('/api/apps/', json={})

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
        self.assertEqual(empty_es_json, data['app_state'])

    def test_update_app_api(self):
        list_response = self.client.get('/api/apps/')
        app_id = list_response.json()[0]['id']
        response = self.client.put(f'/api/apps/{app_id}/', json={'chart': {'focused': {'step': 10}}})
        self.assertEqual(response.status_code, 200)
        get_response = self.client.get(f'/api/apps/{app_id}/')
        data = get_response.json()
        self.assertEqual(10, data['app_state']['chart']['focused']['step'])

    def test_delete_app_api(self):
        list_response = self.client.get('/api/apps/')
        app_id = list_response.json()[0]['id']
        response = self.client.delete(f'/api/apps/{app_id}/')
        self.assertEqual(200, response.status_code)
        get_response = self.client.get(f'/api/apps/{app_id}/')
        self.assertEqual(404, get_response.status_code)

    def test_create_app_api(self):
        response = self.client.post('/api/apps/', json=example_request_es_json)
        self.assertEqual(201, response.status_code)
        app_id = response.json()['id']
        get_response = self.client.get(f'/api/apps/{app_id}/')
        data = get_response.json()
        self.assertEqual(app_id, data['id'])
        self.assertEqual(example_response_es_json, data['app_state'])

    def test_incorrect_request_body(self):
        response = self.client.post('/api/apps/', json=incorrect_es_json)
        self.assertEqual(403, response.status_code)
        data = response.json()
        self.assertEqual(data['chart']['focused']['step'],
                         "This field must be of type <class 'int'>, <class 'str'> given.")


class TestDashboardsApi(ApiTestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        response = cls.client.post('/api/apps/', json={})
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
