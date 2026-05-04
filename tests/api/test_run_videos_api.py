import random

from aim.sdk.index_manager import RepoIndexManager
from aim.sdk.run import Run
from aim.storage.context import Context
from aim.storage.treeutils import decode_tree
from parameterized import parameterized
from tests.base import ApiTestBase
from tests.utils import decode_encoded_tree_stream, generate_video_set


class TestNoVideosRunQueryApi(ApiTestBase):
    def test_query_videos_api_empty_result(self):
        client = self.client

        query = self.isolated_query_patch()
        response = client.get('/api/runs/search/videos/', params={'q': query, 'report_progress': False})
        self.assertEqual(200, response.status_code)
        self.assertEqual(b'', response.content)


class RunVideosTestBase(ApiTestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        run = cls.create_run(repo=cls.repo)
        run['videos_per_step'] = 4
        for step in range(10):
            videos = generate_video_set(video_count=4, caption_prefix=f'Video {step}')
            run.track(videos, name='random_videos', step=step)
            run.track(random.random(), name='random_values', step=step)
        cls.run_hash = run.hash
        run.close()
        RepoIndexManager.get_index_manager(cls.repo).index(cls.run_hash)
        cls.repo.container_pool.clear()


class TestRunVideosSearchApi(RunVideosTestBase):
    def test_query_videos_api_defaults(self):
        client = self.client

        query = self.isolated_query_patch()
        response = client.get('/api/runs/search/videos/', params={'q': query, 'report_progress': False})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_bytes(chunk_size=512 * 1024)))
        self.assertEqual(1, len(decoded_response))
        run_data = decoded_response[self.run_hash]
        self.assertEqual([0, 10], run_data['ranges']['record_range_total'])
        self.assertEqual([0, 10], run_data['ranges']['record_range_used'])
        self.assertEqual([0, 4], run_data['ranges']['index_range_total'])
        self.assertEqual([0, 4], run_data['ranges']['index_range_used'])
        self.assertEqual(4, run_data['params']['videos_per_step'])

        trace_data = run_data['traces'][0]
        self.assertEqual('random_videos', trace_data['name'])
        self.assertEqual(10, len(trace_data['iters']))
        self.assertEqual(10, len(trace_data['values']))

        video_list = trace_data['values'][2]
        self.assertEqual(4, len(video_list))

        video = video_list[3]
        self.assertEqual('Video 2 3', video['caption'])
        self.assertEqual(3, video['index'])
        self.assertEqual('mp4', video['format'])
        self.assertEqual(27, video['fps'])
        self.assertEqual(len(b'fake mp4 bytes 3'), video['size'])
        self.assertIn('blob_uri', video)
        self.assertNotIn('data', video)

    def test_run_videos_batch_api(self):
        client = self.client

        requested_traces = [
            {'name': 'random_videos', 'context': {}},
        ]

        response = client.post(f'/api/runs/{self.run_hash}/videos/get-batch/', json=requested_traces)
        self.assertEqual(200, response.status_code)

        trace_data = decode_tree(decode_encoded_tree_stream(response.iter_bytes(chunk_size=512 * 1024)))
        self.assertEqual('random_videos', trace_data['name'])
        self.assertDictEqual({}, trace_data['context'])
        self.assertEqual(10, len(trace_data['values']))
        self.assertEqual(list(range(10)), trace_data['iters'])
        self.assertEqual('Video 2 3', trace_data['values'][2][3]['caption'])
        self.assertIn('blob_uri', trace_data['values'][2][3])


class RunVideosURIBulkLoadApi(RunVideosTestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        cls.video_blobs = {}
        run = Run(run_hash=cls.run_hash, read_only=True)
        empty_context = Context({})
        for step in range(3):
            for idx in range(2):
                video_view = run.series_run_trees[1].subtree((empty_context.idx, 'random_videos', 'val', step, idx))
                cls.video_blobs[video_view['caption']] = video_view['data'].load()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.video_blobs.clear()
        super().tearDownClass()

    def setUp(self) -> None:
        super().setUp()
        self.uri_map = {}
        client = self.client

        response = client.get(
            '/api/runs/search/videos/',
            params={
                'q': self.isolated_query_patch(),
                'record_range': '0:3',
                'index_range': '0:2',
                'record_density': 3,
                'index_density': 2,
                'report_progress': False,
            },
        )
        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_bytes(chunk_size=512 * 1024)))
        run_data = decoded_response[self.run_hash]
        trace_data = run_data['traces'][0]
        for video_list in trace_data['values']:
            for video_data in video_list:
                self.uri_map[video_data['blob_uri']] = video_data['caption']

    def tearDown(self) -> None:
        self.uri_map.clear()
        super().tearDown()

    @parameterized.expand([(1,), (3,)])
    def test_videos_uri_bulk_load_api(self, uri_count):
        uris = random.sample(list(self.uri_map.keys()), uri_count)

        client = self.client
        response = client.post('/api/runs/videos/get-batch', json=uris)
        self.assertEqual(200, response.status_code)
        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_bytes(chunk_size=512 * 1024)))
        self.assertEqual(uri_count, len(decoded_response))
        for uri, blob in decoded_response.items():
            expected_blob = self.video_blobs[self.uri_map[uri]]
            self.assertEqual(expected_blob, blob)
