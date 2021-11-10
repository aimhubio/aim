import pytest
from parameterized import parameterized

from PIL import Image as pil_image
import numpy

from tests.base import ApiTestBase
from tests.utils import decode_encoded_tree_stream, generate_image_set

from aim.storage.treeutils import decode_tree
from aim.sdk.run import Run
from aim.sdk.objects.image import Image


class TestRunImagesApi(ApiTestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        run = Run(repo=cls.repo)
        run['images_per_step'] = 16
        for step in range(100):
            images = generate_image_set(img_count=16, caption_prefix=f'Image {step}')
            run.track(images, name='random_images')
        cls.run_hash = run.hash

    def test_query_images_api_defaults(self):
        client = self.client

        response = client.get('/api/runs/search/images/', params={'q': ''})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=512*1024)))
        self.assertEqual(1, len(decoded_response))
        run_data = decoded_response[self.run_hash]
        self.assertEqual([0, 100], run_data['ranges']['record_range'])
        self.assertEqual([0, 100, 2], run_data['ranges']['record_slice'])
        self.assertEqual([0, 16], run_data['ranges']['index_range'])
        self.assertEqual([0, 16, 3], run_data['ranges']['index_slice'])
        self.assertEqual(16, run_data['params']['images_per_step'])

        trace_data = run_data['traces'][0]
        self.assertEqual('random_images', trace_data['trace_name'])
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

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=512*1024)))
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

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=512*1024)))
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
        ('10:20', 10, 20, 10, 20, 1, 10),
        (':30', 0, 100, 0, 30, 1, 30),
        ('30:', 0, 100, 30, 100, 1, 70)
    ])
    def test_query_images_api_custom_record_ranges(self, input_range, rstart, rstop, start, stop, step, count):
        client = self.client

        response = client.get('/api/runs/search/images/', params={'record_range': input_range, 'record_density': 100})
        self.assertEqual(200, response.status_code)

        decoded_response = decode_tree(decode_encoded_tree_stream(response.iter_content(chunk_size=512*1024)))
        self.assertEqual(1, len(decoded_response))
        run_data = decoded_response[self.run_hash]
        self.assertEqual([rstart, rstop], run_data['ranges']['record_range'])
        self.assertEqual([start, stop, step], run_data['ranges']['record_slice'])
        trace_data = run_data['traces'][0]
        self.assertEqual(count, len(trace_data['values']))
        self.assertEqual(count, len(trace_data['iters']))
        self.assertEqual(start, trace_data['iters'][0])
        self.assertEqual(stop - 1, trace_data['iters'][-1])

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
        self.assertEqual([0, 100], run_data['ranges']['record_range'])
        self.assertEqual([10, 20, 1], run_data['ranges']['record_slice'])
        self.assertEqual([0, 16], run_data['ranges']['index_range'])
        self.assertEqual([3, 6, 1], run_data['ranges']['index_slice'])

        trace_data = run_data['traces'][0]
        self.assertEqual(10, len(trace_data['values']))
        self.assertEqual(10, len(trace_data['iters']))
        self.assertEqual(10, trace_data['iters'][0])
        self.assertEqual(19, trace_data['iters'][-1])

        img_list = trace_data['values'][2]
        self.assertEqual(3, len(img_list))
        img_indices = [img['index'] for img in img_list]
        self.assertListEqual([3, 4, 5], img_indices)


class TestNoImagesRunQueryApi(ApiTestBase):
    def test_query_images_api_empty_result(self):
        client = self.client

        response = client.get('/api/runs/search/images/')
        self.assertEqual(200, response.status_code)
        self.assertEqual(b'', response.content)
