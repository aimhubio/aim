from parameterized import parameterized
import random

from tests.base import ApiTestBase
from tests.utils import decode_encoded_tree_stream, generate_image_set

from aim.storage.treeutils import decode_tree
from aim.storage.context import Context
from aim.storage.types import BLOB
from aim.sdk.run import Run


class TestNoImagesRunQueryApi(ApiTestBase):
    def test_query_images_api_empty_result(self):
        client = self.client

        response = client.get('/api/runs/search/images/')
        self.assertEqual(200, response.status_code)
        self.assertEqual(b'', response.content)


class RunImagesTestBase(ApiTestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        run = Run(repo=cls.repo)
        run['images_per_step'] = 16
        for step in range(100):
            images = generate_image_set(img_count=16, caption_prefix=f'Image {step}')
            run.track(images, name='random_images')
            run.track(random.random(), name='random_values')
        cls.run_hash = run.hash


class TestRunImagesSearchApi(RunImagesTestBase):
    def test_query_images_api_defaults(self):
        client = self.client

        response = client.get('/api/runs/search/images/', params={'q': ''})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=512 * 1024)))
        self.assertEqual(1, len(decoded_response))
        run_data = decoded_response[self.run_hash]
        self.assertEqual([0, 100], run_data['ranges']['record_range_total'])
        self.assertEqual([0, 100], run_data['ranges']['record_range_used'])
        self.assertEqual([0, 16], run_data['ranges']['index_range_total'])
        self.assertEqual([0, 16], run_data['ranges']['index_range_used'])
        self.assertEqual(16, run_data['params']['images_per_step'])

        trace_data = run_data['traces'][0]
        self.assertEqual('random_images', trace_data['name'])
        self.assertEqual(50, len(trace_data['iters']))
        self.assertEqual(4, trace_data['iters'][2])
        self.assertEqual(50, len(trace_data['values']))

        img_list = trace_data['values'][2]
        self.assertEqual(6, len(img_list))

        img = img_list[3]
        self.assertEqual('Image 4 9', img['caption'])
        self.assertEqual(9, img['index'])
        self.assertEqual(16, img['width'])
        self.assertEqual(16, img['height'])
        self.assertEqual('png', img['format'])
        self.assertIn('blob_uri', img)

    def test_query_images_api_custom_densities_dense(self):
        client = self.client

        response = client.get('/api/runs/search/images/', params={'record_density': 200, 'index_density': 10})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=512 * 1024),
                                                                  concat_chunks=True))
        self.assertEqual(1, len(decoded_response))
        run_data = decoded_response[self.run_hash]
        trace_data = run_data['traces'][0]
        self.assertEqual(100, len(trace_data['values']))
        self.assertEqual(100, len(trace_data['iters']))
        self.assertEqual(16, len(trace_data['values'][0]))
        self.assertEqual(16, len(trace_data['values'][99]))

    def test_query_images_api_custom_densities_sparse(self):
        client = self.client

        response = client.get('/api/runs/search/images/', params={'record_density': 10, 'index_density': 4})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=512 * 1024)))
        self.assertEqual(1, len(decoded_response))
        run_data = decoded_response[self.run_hash]
        trace_data = run_data['traces'][0]
        self.assertEqual(10, len(trace_data['values']))
        self.assertEqual(10, len(trace_data['iters']))
        self.assertEqual(4, len(trace_data['values'][0]))
        self.assertEqual(4, len(trace_data['values'][9]))
        image_indices = [img['index'] for img in trace_data['values'][0]]
        self.assertListEqual([0, 4, 8, 12], image_indices)
        image_names = [img['caption'] for img in trace_data['values'][9]]
        self.assertListEqual(['Image 90 0', 'Image 90 4', 'Image 90 8', 'Image 90 12'], image_names)

    @parameterized.expand([
        ('10:20', [0, 100], [10, 20], 10),
        (':30', [0, 100], [0, 30], 30),
        ('30:', [0, 100], [30, 100], 70)
    ])
    def test_query_images_api_custom_record_ranges(self, input_range, total_range, used_range, count):
        client = self.client

        response = client.get('/api/runs/search/images/', params={'record_range': input_range, 'record_density': 100})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=512 * 1024)))
        self.assertEqual(1, len(decoded_response))
        run_data = decoded_response[self.run_hash]
        self.assertEqual(total_range, run_data['ranges']['record_range_total'])
        self.assertEqual(used_range, run_data['ranges']['record_range_used'])
        trace_data = run_data['traces'][0]
        self.assertEqual(count, len(trace_data['values']))
        self.assertEqual(count, len(trace_data['iters']))
        self.assertEqual(used_range[0], trace_data['iters'][0])
        self.assertEqual(used_range[-1] - 1, trace_data['iters'][-1])

    def test_query_images_api_calculate_ranges(self):
        client = self.client

        response = client.get('/api/runs/search/images/', params={
            'record_range': '10:20',
            'index_range': '3:6',
            'calc_ranges': True
        })
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=512 * 1024)))
        self.assertEqual(1, len(decoded_response))
        run_data = decoded_response[self.run_hash]
        self.assertEqual([0, 100], run_data['ranges']['record_range_total'])
        self.assertEqual([10, 20], run_data['ranges']['record_range_used'])
        self.assertEqual([0, 16], run_data['ranges']['index_range_total'])
        self.assertEqual([3, 6], run_data['ranges']['index_range_used'])

        trace_data = run_data['traces'][0]
        self.assertEqual(10, len(trace_data['values']))
        self.assertEqual(10, len(trace_data['iters']))
        self.assertEqual(10, trace_data['iters'][0])
        self.assertEqual(19, trace_data['iters'][-1])

        img_list = trace_data['values'][2]
        self.assertEqual(3, len(img_list))
        img_indices = [img['index'] for img in img_list]
        self.assertListEqual([3, 4, 5], img_indices)


class RunImagesURIBulkLoadApi(RunImagesTestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        cls.image_blobs = {}
        run = Run(run_hash=cls.run_hash, read_only=True)
        empty_context = Context({})
        for step in range(10):
            for idx in range(5):
                img_view = run.series_run_tree.subtree(
                    (empty_context.idx, 'random_images', 'val', step, idx)
                )
                cls.image_blobs[img_view['caption']] = img_view['data'].load()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.image_blobs.clear()
        super().tearDownClass()

    def setUp(self) -> None:
        super().setUp()
        self.uri_map = {}
        client = self.client

        response = client.get('/api/runs/search/images/', params={
            'record_range': '0:10',
            'index_range': '0:5',
        })
        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=512 * 1024)))
        run_data = decoded_response[self.run_hash]
        trace_data = run_data['traces'][0]
        for img_list in trace_data['values']:
            for img_data in img_list:
                self.uri_map[img_data['blob_uri']] = img_data['caption']

    def tearDown(self) -> None:
        self.uri_map.clear()
        super().tearDown()

    @parameterized.expand([(1,), (5,), (10,)])
    def test_images_uri_bulk_load_api(self, uri_count):
        # take random N URIs
        uris = random.sample(self.uri_map.keys(), uri_count)

        client = self.client
        response = client.post('/api/runs/images/get-batch', json=uris)
        self.assertEqual(200, response.status_code)
        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=512 * 1024)))
        self.assertEqual(uri_count, len(decoded_response))
        for uri, blob in decoded_response.items():
            expected_blob = self.image_blobs[self.uri_map[uri]]
            self.assertEqual(expected_blob, blob)


class TestRunImagesBatchApi(RunImagesTestBase):
    def test_run_images_bulk_load_api(self):
        client = self.client

        requested_traces = [
            {'name': 'random_images', 'context': {}},
        ]

        response = client.post(f'/api/runs/{self.run_hash}/images/get-batch/', json=requested_traces)
        self.assertEqual(200, response.status_code)

        trace_data = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=512 * 1024)))
        self.assertEqual('random_images', trace_data['name'])
        self.assertDictEqual({}, trace_data['context'])
        self.assertEqual(50, len(trace_data['values']))
        self.assertListEqual(list(range(0, 100, 2)), trace_data['iters'])

        img_list = trace_data['values'][2]
        self.assertEqual(6, len(img_list))

        img = img_list[3]
        self.assertEqual('Image 4 9', img['caption'])
        self.assertEqual(9, img['index'])
        self.assertEqual(16, img['width'])
        self.assertEqual(16, img['height'])
        self.assertEqual('png', img['format'])
        self.assertIn('blob_uri', img)


class TestImageListsAndSingleImagesSearchApi(ApiTestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()

        run = Run(system_tracking_interval=None)
        cls.run_hash = run.hash

        for step in range(5):
            images = generate_image_set(img_count=5, caption_prefix=f'Image {step}')
            run.track(images, name='image_lists', context={})
            run.track(images[0], name='single_images', context={})

    def test_search_simgle_image_only_default_index_range(self):
        client = self.client

        response = client.get('/api/runs/search/images/', params={'q': 'images.name == "single_images"'})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=512 * 1024)))
        self.assertEqual(1, len(decoded_response))
        run_data = decoded_response[self.run_hash]
        self.assertEqual([0, 5], run_data['ranges']['record_range_total'])
        self.assertEqual([0, 5], run_data['ranges']['record_range_used'])
        self.assertEqual([0, 1], run_data['ranges']['index_range_total'])
        self.assertEqual([0, 1], run_data['ranges']['index_range_used'])

        self.assertEqual(1, len(run_data['traces']))
        trace_data = run_data['traces'][0]
        self.assertEqual('single_images', trace_data['name'])
        self.assertEqual(5, len(trace_data['values']))
        img_list = trace_data['values'][0]
        self.assertEqual(1, len(img_list))

    def test_mixed_search_default_index_range(self):
        client = self.client

        response = client.get('/api/runs/search/images/', params={'q': ''})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=512 * 1024)))
        self.assertEqual(1, len(decoded_response))
        run_data = decoded_response[self.run_hash]
        self.assertEqual([0, 5], run_data['ranges']['record_range_total'])
        self.assertEqual([0, 5], run_data['ranges']['record_range_used'])
        self.assertEqual([0, 5], run_data['ranges']['index_range_total'])
        self.assertEqual([0, 5], run_data['ranges']['index_range_used'])

        self.assertEqual(2, len(run_data['traces']))
        trace_data = run_data['traces'][0]
        self.assertEqual('image_lists', trace_data['name'])
        self.assertEqual(5, len(trace_data['values']))
        img_list = trace_data['values'][0]
        self.assertEqual(5, len(img_list))

        trace_data = run_data['traces'][1]
        self.assertEqual('single_images', trace_data['name'])
        self.assertEqual(5, len(trace_data['values']))
        img_list = trace_data['values'][0]
        self.assertEqual(1, len(img_list))

    def test_mixed_search_custom_index_range(self):
        client = self.client

        response = client.get('/api/runs/search/images/', params={'q': '', 'index_range': '3:5'})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=512 * 1024)))
        self.assertEqual(1, len(decoded_response))
        run_data = decoded_response[self.run_hash]
        self.assertEqual([0, 5], run_data['ranges']['record_range_total'])
        self.assertEqual([0, 5], run_data['ranges']['record_range_used'])
        self.assertEqual([0, 5], run_data['ranges']['index_range_total'])
        self.assertEqual([3, 5], run_data['ranges']['index_range_used'])

        self.assertEqual(2, len(run_data['traces']))
        trace_data = run_data['traces'][0]
        self.assertEqual('image_lists', trace_data['name'])
        self.assertEqual(5, len(trace_data['values']))
        img_list = trace_data['values'][0]
        self.assertEqual(2, len(img_list))

        trace_data = run_data['traces'][1]
        self.assertEqual('single_images', trace_data['name'])
        self.assertEqual(5, len(trace_data['values']))
        img_list = trace_data['values'][0]
        self.assertListEqual([], img_list)


class TestRunInfoApi(ApiTestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()

        # run1 -> context {'subset': 'train'} -> Image[]
        #      |                              -> integers
        #      |                              -> floats
        #      -> context {'subset': 'val'}   -> floats
        # ------------------------------------------------
        # run2 -> context {'subset': 'train'} -> Image
        #      |                              -> floats
        #      -> context {'subset': 'val'}   -> floats

        run1 = Run(system_tracking_interval=None)
        cls.run1_hash = run1.hash
        images = generate_image_set(img_count=2, caption_prefix=f'Image 0')
        run1.track(images, name='image_lists', context={'subset': 'train'})
        run1.track(random.random(), name='floats', context={'subset': 'train'})
        run1.track(random.randint(100, 200), name='integers', context={'subset': 'train'})
        run1.track(random.random(), name='floats', context={'subset': 'val'})

        run2 = Run(system_tracking_interval=None)
        run2.track(images[0], name='single_images', context={'subset': 'val'})
        run2.track(random.random(), name='floats', context={'subset': 'train'})
        run2.track(random.random(), name='floats', context={'subset': 'val'})
        cls.run2_hash = run2.hash

    def test_run_info_get_images_only_api(self):
        client = self.client
        response = client.get(f'api/runs/{self.run1_hash}/info', params={'sequence': 'images'})
        self.assertEqual(200, response.status_code)
        response_data = response.json()
        self.assertEqual(1, len(response_data['traces']))
        self.assertIn('images', response_data['traces'])
        self.assertDictEqual({'subset': 'train'}, response_data['traces']['images'][0]['context'])
        self.assertEqual('image_lists', response_data['traces']['images'][0]['name'])

        response = client.get(f'api/runs/{self.run2_hash}/info', params={'sequence': 'images'})
        self.assertEqual(200, response.status_code)
        response_data = response.json()
        self.assertEqual(1, len(response_data['traces']))
        self.assertIn('images', response_data['traces'])
        self.assertDictEqual({'subset': 'val'}, response_data['traces']['images'][0]['context'])
        self.assertEqual('single_images', response_data['traces']['images'][0]['name'])

    @parameterized.expand([
        ({'sequence': ('metric', 'images', 'audios', 'distributions', 'figures', 'texts')},),  # explicit specification
        (None,)                                                                                # default
    ])
    def test_run_info_get_all_sequences_api(self, qparams):
        client = self.client
        response = client.get(f'api/runs/{self.run1_hash}/info', params=qparams)
        self.assertEqual(200, response.status_code)
        response_data = response.json()
        self.assertEqual(6, len(response_data['traces']))
        self.assertIn('images', response_data['traces'])
        self.assertIn('audios', response_data['traces'])
        self.assertIn('metric', response_data['traces'])
        self.assertIn('distributions', response_data['traces'])
        self.assertIn('figures', response_data['traces'])
        self.assertIn('texts', response_data['traces'])
        self.assertDictEqual({'subset': 'train'}, response_data['traces']['images'][0]['context'])
        self.assertEqual('image_lists', response_data['traces']['images'][0]['name'])
        metrics_data = response_data['traces']['metric']
        self.assertEqual(3, len(metrics_data))
        self.assertEqual('floats', metrics_data[0]['name'])
        self.assertEqual('floats', metrics_data[1]['name'])
        self.assertEqual('integers', metrics_data[2]['name'])
        self.assertDictEqual({'subset': 'val'}, metrics_data[0]['context'])
        self.assertDictEqual({'subset': 'train'}, metrics_data[1]['context'])
        self.assertDictEqual({'subset': 'train'}, metrics_data[2]['context'])

        response = client.get(f'api/runs/{self.run2_hash}/info', params={'sequence': ('images', 'metric')})
        self.assertEqual(200, response.status_code)
        response_data = response.json()
        self.assertEqual(2, len(response_data['traces']))
        self.assertIn('images', response_data['traces'])
        self.assertIn('metric', response_data['traces'])
        self.assertDictEqual({'subset': 'val'}, response_data['traces']['images'][0]['context'])
        self.assertEqual('single_images', response_data['traces']['images'][0]['name'])
        metrics_data = response_data['traces']['metric']
        self.assertEqual(2, len(metrics_data))
        self.assertEqual('floats', metrics_data[0]['name'])
        self.assertEqual('floats', metrics_data[1]['name'])
        self.assertDictEqual({'subset': 'val'}, metrics_data[0]['context'])
        self.assertDictEqual({'subset': 'train'}, metrics_data[1]['context'])

    def test_run_info_get_metrics_only_api(self):
        client = self.client
        response = client.get(f'api/runs/{self.run1_hash}/info', params={'sequence': 'metric'})
        self.assertEqual(200, response.status_code)
        response_data = response.json()
        self.assertEqual(1, len(response_data['traces']))
        self.assertIn('metric', response_data['traces'])
        self.assertEqual(3, len(response_data['traces']['metric']))

        response = client.get(f'api/runs/{self.run2_hash}/info', params={'sequence': 'metric'})
        self.assertEqual(200, response.status_code)
        response_data = response.json()
        self.assertEqual(1, len(response_data['traces']))
        self.assertIn('metric', response_data['traces'])
        self.assertEqual(2, len(response_data['traces']['metric']))

    def test_invalid_sequence_type(self):
        client = self.client
        response = client.get(f'api/runs/{self.run1_hash}/info', params={'sequence': 'non-existing-sequence'})
        self.assertEqual(400, response.status_code)
