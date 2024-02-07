import pytest
import numpy as np
from parameterized import parameterized

from tests.base import PrefilledDataApiTestBase, ApiTestBase
from tests.utils import decode_encoded_tree_stream

from aim.storage.treeutils import decode_tree
from aim.sdk.run import Run


class TestRunApi(PrefilledDataApiTestBase):
    def test_search_runs_api(self):
        client = self.client

        query = self.isolated_query_patch('run["name"] == "Run # 3"')
        response = client.get('/api/runs/search/run/', params={'q': query,
                                                               'report_progress': False})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_bytes(chunk_size=512*1024)))
        self.assertEqual(1, len(decoded_response))
        for _, run in decoded_response.items():
            self.assertEqual(4, len(run['traces']['metric']))
            for trace in run['traces']['metric']:
                self.assertAlmostEqual(0.99, trace['values']['last'])

    def test_search_runs_api_paginated(self):
        client = self.client

        query = self.isolated_query_patch('run["name"] in ["Run # 2","Run # 3"]')
        response = client.get('/api/runs/search/run/', params={'q': query,
                                                               'limit': 1, 'report_progress': False})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_bytes(chunk_size=1024 * 1024)))
        self.assertEqual(1, len(decoded_response))

        offset = ''
        for run_hash, run in decoded_response.items():
            offset = run_hash
            self.assertEqual('Run # 3', run['props']['name'])

        query = self.isolated_query_patch('run["name"] in ["Run # 2","Run # 3"]')
        response = client.get('/api/runs/search/run/', params={'q': query,
                                                               'limit': 5,
                                                               'offset': offset,
                                                               'report_progress': False})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_bytes(chunk_size=1024 * 1024)))
        self.assertEqual(1, len(decoded_response))
        for run_hash, run in decoded_response.items():
            self.assertEqual('Run # 2', run['props']['name'])

    def test_search_metrics_api_default_step(self):
        client = self.client

        query = self.isolated_query_patch('run["name"] == "Run # 3"')
        response = client.get('/api/runs/search/metric/', params={'q': query,
                                                                  'report_progress': False})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_bytes(chunk_size=512*1024)))
        for run in decoded_response.values():
            for trace in run['traces']:
                self.assertEqual([0, 0, 50], trace['slice'])
                values = trace['values']
                dtype = values['dtype']
                shape = values['shape']
                data = values['blob']
                array = np.frombuffer(data, dtype=dtype).reshape(shape)
                self.assertEqual(50, shape)  # default 50 steps
                self.assertAlmostEqual(0.99, array.max())
                self.assertAlmostEqual(0.99, array[49])
                self.assertEqual(50, len(array))

    @parameterized.expand([
        (10,),
        (2,),
        (90,),
    ])
    def test_search_metrics_api_custom_step(self, step_count):
        client = self.client

        query = self.isolated_query_patch('run["name"] == "Run # 3"')
        response = client.get('/api/runs/search/metric/', params={'q': query,
                                                                  'p': step_count,
                                                                  'report_progress': False})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_bytes(chunk_size=512*1024)))
        for run in decoded_response.values():
            for trace in run['traces']:
                self.assertEqual([0, 0, step_count], trace['slice'])
                values = trace['values']
                dtype = values['dtype']
                shape = values['shape']
                data = values['blob']
                array = np.frombuffer(data, dtype=dtype).reshape(shape)
                self.assertEqual(step_count, shape)
                self.assertAlmostEqual(0.99, array.max())
                self.assertAlmostEqual(0.99, array[step_count - 1])
                self.assertEqual(step_count, len(array))

    def test_search_aligned_metrics_api(self):
        client = self.client
        run_hashes = []
        for run, _ in zip(self.repo.iter_runs(), range(2)):
            run_hashes.append(run.hash)

        response = client.post('/api/runs/search/metric/align/', json={
            'align_by': 'accuracy',
            'runs': [{
                'run_id': run_hashes[0],
                'traces': [{'name': 'loss', 'slice': [0, 0, 100], 'context': {'is_training': False}}]
            }, {
                'run_id': run_hashes[1],
                'traces': [{'name': 'loss', 'slice': [0, 0, 100], 'context': {'is_training': True, 'subset': 'train'}}]
            }]
        })
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_bytes(chunk_size=512*1024)))
        self.assertEqual(2, len(decoded_response))
        self.assertListEqual(run_hashes, list(decoded_response.keys()))
        self.assertEqual([], decoded_response[run_hashes[1]])
        traces = decoded_response[run_hashes[0]][0]
        self.assertEqual('loss', traces['name'])
        self.assertDictEqual({'is_training': False}, traces['context'])
        self.assertEqual(99, traces['x_axis_values']['shape'])

    @pytest.mark.skip(reason="low priority. requires more investigation.")
    def test_search_aligned_metrics_api_with_wrong_context(self):
        client = self.client
        run_hashes = []
        for run, _ in zip(self.repo.iter_runs(), range(2)):
            run_hashes.append(run.hash)

        response = client.post('/api/runs/search/metric/align/', json={
            'align_by': 'accuracy',
            'runs': [{
                'run_id': run_hashes[0],
                'traces': [{'name': 'loss', 'slice': [0, 20, 1], 'context': {'is_training': True, 'subset': 'training'}}]
            }, {
                'run_id': run_hashes[1],
                'traces': [{'name': 'loss', 'slice': [0, 10, 1], 'context': {'is_training': True, 'subset': 'val'}}]
            }]
        })
        self.assertEqual(200, response.status_code)
        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_bytes(chunk_size=1024 * 1024)))
        self.assertEqual(2, len(decoded_response))
        for run in decoded_response.values():
            self.assertEqual([], run)

    def test_run_info_api(self):
        run = self._find_run_by_name('Run # 1')

        self.assertEqual('Run # 1', run.name)
        client = self.client
        response = client.get(f'/api/runs/{run.hash}/info/')
        self.assertEqual(200, response.status_code)

        data = response.json()
        run_params = data['params']
        self.assertEqual(1, run_params['run_index'])
        self.assertEqual(0.001, run_params['hparams']['lr'])

        run_traces_overview = data['traces']['metric']
        self.assertEqual(4, len(run_traces_overview))
        for trc_overview in run_traces_overview:
            self.assertIn(trc_overview['name'], ['loss', 'accuracy'])

        run_props = data['props']

        self.assertLess(run_props['creation_time'], run_props['end_time'])
        self.assertEqual('Run # 1', run_props['name'])
        self.assertEqual('default', run_props['experiment']['name'])
        self.assertEqual(0, len(run_props['tags']))

    def test_run_traces_batch_api(self):
        run = self._find_run_by_name('Run # 1')
        client = self.client
        requested_traces = [
            {'name': 'accuracy', 'context': {'is_training': False}},
            {'name': 'loss', 'context': {'is_training': True, 'subset': 'train'}}
        ]
        response = client.post(f'/api/runs/{run.hash}/metric/get-batch/', json=requested_traces)
        self.assertEqual(200, response.status_code)

        traces_batch = response.json()
        self.assertEqual(2, len(traces_batch))
        self.assertEqual('accuracy', traces_batch[0]['name'])
        self.assertEqual(100, len(traces_batch[0]['values']))
        self.assertEqual(False, traces_batch[0]['context']['is_training'])

        self.assertEqual('loss', traces_batch[1]['name'])
        self.assertEqual(100, len(traces_batch[1]['values']))
        self.assertEqual(True, traces_batch[1]['context']['is_training'])
        self.assertEqual('train', traces_batch[1]['context']['subset'])

    def _find_run_by_name(self, name: str) -> Run:
        repo = self.repo
        for run in repo.iter_runs():
            if run.name == name or run.get('name') == name:
                return run
        return None


class TestRunInfoApi(ApiTestBase):
    @pytest.mark.gh_2267
    def test_run_info_api_with_tags(self):
        """covers https://github.com/aimhubio/aim/issues/2267"""
        run = Run(system_tracking_interval=None)
        run.add_tag('Best Run')
        run.close()

        client = self.client
        response = client.get(f'/api/runs/{run.hash}/info/')
        self.assertEqual(200, response.status_code)

        data = response.json()
        run_props = data['props']

        self.assertEqual(1, len(run_props['tags']))
        self.assertEqual('Best Run', run_props['tags'][0]['name'])
        self.assertIsNone(run_props['tags'][0]['color'])
        self.assertIsNone(run_props['tags'][0]['description'])
        tag_id = run_props['tags'][0]['id']

        # Edit tag
        tag = self.repo.structured_db.find_tag(tag_id)
        tag.description = 'Long description for tag'

        response = client.get(f'/api/runs/{run.hash}/info/')
        self.assertEqual(200, response.status_code)

        data = response.json()
        run_props = data['props']

        self.assertEqual(1, len(run_props['tags']))
        self.assertEqual('Long description for tag', run_props['tags'][0]['description'])

