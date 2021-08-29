import pytest
import numpy as np
from parameterized import parameterized

from tests.base import ApiTestBase
from tests.utils import decode_encoded_tree_stream

from aim.storage.treeutils import decode_tree


class TestRunApi(ApiTestBase):
    def test_search_runs_api(self):
        client = self.client

        response = client.get('/api/runs/search/run/', params={'q': 'run["name"] == "Run # 3"'})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=1024*1024)))
        self.assertEqual(1, len(decoded_response))
        for hashname, run in decoded_response.items():
            self.assertEqual(4, len(run['traces']))
            for trace in run['traces']:
                self.assertAlmostEqual(0.99, trace['last_value']['last'])

    def test_search_metrics_api_default_step(self):
        client = self.client

        response = client.get('/api/runs/search/metric/', params={'q': 'run["name"] == "Run # 3"'})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=1024*1024)))
        for run in decoded_response.values():
            for trace in run['traces']:
                self.assertEqual([0, 100, 2], trace['slice'])
                values = trace['values']
                dtype = values['dtype']
                shape = values['shape']
                data = values['blob']
                array = np.frombuffer(data, dtype=dtype).reshape(shape)
                self.assertEqual(51, shape)  # default 50 steps
                self.assertAlmostEqual(0.99, array.max())
                self.assertAlmostEqual(0.99, array[50])
                self.assertEqual(51, len(array))

    @parameterized.expand([
        (10, 11),
        (2, 3),
        (90, 100),
    ])
    def test_search_metrics_api_custom_step(self, step_count, expected_step_count):
        client = self.client

        response = client.get('/api/runs/search/metric/', params={'q': 'run["name"] == "Run # 3"', 'p': step_count})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=1024*1024)))
        if (100 // step_count) <= 1:
            array_last_idx = 99
        else:
            array_last_idx = step_count
        for run in decoded_response.values():
            for trace in run['traces']:
                self.assertEqual([0, 100, (100 // step_count) or 1], trace['slice'])
                values = trace['values']
                dtype = values['dtype']
                shape = values['shape']
                data = values['blob']
                array = np.frombuffer(data, dtype=dtype).reshape(shape)
                self.assertEqual(expected_step_count, shape)
                self.assertAlmostEqual(0.99, array.max())
                self.assertAlmostEqual(0.99, array[array_last_idx])
                self.assertEqual(0.0, array[0])
                self.assertEqual(expected_step_count, len(array))

    def test_search_aligned_metrics_api(self):
        client = self.client
        hash_names = []
        for run, _ in zip(self.repo.iter_runs(), range(2)):
            hash_names.append(run.hashname)

        response = client.post('/api/runs/search/metric/align/', json={
            'align_by': 'accuracy',
            'runs': [{
                'run_id': hash_names[0],
                'traces': [{'metric_name': 'loss', 'slice': [0, 100, 1], 'context': {'is_training': False}}]
            }, {
                'run_id': hash_names[1],
                'traces': [{'metric_name': 'loss', 'slice': [0, 100, 1], 'context': {'is_training': True, 'subset': 'train'}}]
            }]
        })
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=1024*1024)))
        self.assertEqual(2, len(decoded_response))
        self.assertListEqual(hash_names, list(decoded_response.keys()))
        self.assertEqual([], decoded_response[hash_names[1]])
        traces = decoded_response[hash_names[0]][0]
        self.assertEqual('loss', traces['metric_name'])
        self.assertDictEqual({'is_training': False}, traces['context'])
        self.assertEqual(99, traces['x_axis_values']['shape'])

    @pytest.mark.skip(reason="low priority. requires more investigation.")
    def test_search_aligned_metrics_api_with_wrong_context(self):
        client = self.client
        hash_names = []
        for run, _ in zip(self.repo.iter_runs(), range(2)):
            hash_names.append(run.hashname)

        response = client.post('/api/runs/search/metric/align/', json={
            'align_by': 'accuracy',
            'runs': [{
                'run_id': hash_names[0],
                'traces': [{'metric_name': 'loss', 'slice': [0, 20, 1], 'context': {'is_training': True, 'subset': 'training'}}]
            }, {
                'run_id': hash_names[1],
                'traces': [{'metric_name': 'loss', 'slice': [0, 10, 1], 'context': {'is_training': True, 'subset': 'val'}}]
            }]
        })
        self.assertEqual(200, response.status_code)
        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=1024 * 1024)))
        self.assertEqual(2, len(decoded_response))
        for run in decoded_response.values():
            self.assertEqual([], run)

    def test_run_info_api(self):
        run = self._find_run_by_name('Run # 1')

        self.assertEqual('Run # 1', run.props.name)
        client = self.client
        response = client.get(f'/api/runs/{run.hashname}/info/')
        self.assertEqual(200, response.status_code)

        data = response.json()
        run_params = data['params']
        self.assertEqual(1, run_params['run_index'])
        self.assertEqual(0.001, run_params['hparams']['lr'])

        run_traces_overview = data['traces']
        self.assertEqual(4, len(run_traces_overview))
        for trc_overview in run_traces_overview:
            self.assertAlmostEqual(0.99, trc_overview['last_value']['last'])

        run_props = data['props']

        self.assertEqual('Run # 1', run_props['name'])
        self.assertEqual('default', run_props['experiment'])
        self.assertEqual(0, len(run_props['tags']))

    def test_run_traces_batch_api(self):
        run = self._find_run_by_name('Run # 1')
        client = self.client
        requested_traces = [
            {'metric_name': 'accuracy', 'context': {'is_training': False}},
            {'metric_name': 'loss', 'context': {'is_training': True, 'subset': 'train'}}
        ]
        response = client.post(f'/api/runs/{run.hashname}/traces/get-batch/', json=requested_traces)
        self.assertEqual(200, response.status_code)

        traces_batch = response.json()
        self.assertEqual(2, len(traces_batch))
        self.assertEqual('accuracy', traces_batch[0]['metric_name'])
        self.assertEqual(100, len(traces_batch[0]['values']))
        self.assertEqual(False, traces_batch[0]['context']['is_training'])

        self.assertEqual('loss', traces_batch[1]['metric_name'])
        self.assertEqual(100, len(traces_batch[1]['values']))
        self.assertEqual(True, traces_batch[1]['context']['is_training'])
        self.assertEqual('train', traces_batch[1]['context']['subset'])

    def _find_run_by_name(self, name: str):
        repo = self.repo
        for run in repo.iter_runs():
            if run.props.name == name or run['name'] == name:
                return run
        return None
