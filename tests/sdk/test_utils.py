import os
import unittest

from unittest import mock
from unittest.mock import MagicMock

import aim.sdk.utils as utils


class TestUtils(unittest.TestCase):
    def setUp(self):
        self.maxDiff = None

    def test_should_search_aim_repo_not_found_back_slash(self):
        # arrange
        path = '/'

        # act
        path, found = utils.search_aim_repo(path)

        # assert
        self.assertFalse(found)
        self.assertIsNone(path)

    @mock.patch('os.path.exists')
    def test_should_search_aim_repo_not_found_dot_back_slash(self, mock_os_path_exists: mock.MagicMock):
        # arrange
        path = './'
        built_dir = os.path.dirname(__file__)
        build_dir_split = built_dir.split(os.sep)
        mock_os_path_exists.side_effect = [False] * len(build_dir_split)

        # act
        path, found = utils.search_aim_repo(path)

        # assert
        self.assertFalse(found)
        self.assertIsNone(path)

    def test_should_generate_run_hash_default_len(self):
        # arrange
        expected_hash_len = 24

        # act
        actual_hash = utils.generate_run_hash()

        # assert
        self.assertIsInstance(actual_hash, str)
        self.assertEqual(expected_hash_len, len(actual_hash))

    def test_should_generate_run_hash_twelve_char_long(self):
        # arrange
        hash_length = 12
        expected_hash_len = 12

        # act
        actual_hash = utils.generate_run_hash(hash_length)

        # assert
        self.assertIsInstance(actual_hash, str)
        self.assertEqual(expected_hash_len, len(actual_hash))

    @mock.patch('uuid.uuid4')
    def test_should_generate_run_hash_six_char_long(self, mock_uuid: MagicMock):
        # arrange
        expected_uuid_hex = '16710b81-ccab-4409-bd79-50a770b565a6'
        mock_uuid.return_value.hex = expected_uuid_hex
        hash_length = 6
        expected_hash_len = 6

        # act
        actual_hash = utils.generate_run_hash(hash_length)

        # assert
        self.assertIsInstance(actual_hash, str)
        self.assertEqual(expected_hash_len, len(actual_hash))
        self.assertEqual(expected_uuid_hex[:expected_hash_len], actual_hash)
        mock_uuid.assert_called_once()

    def test_should_get_obj_type_name_str(self):
        # arrange
        obj = 'hello aim!'
        expected_type = 'str'

        # act
        actual_type = utils.get_object_typename(obj)

        # assert
        self.assertEqual(expected_type, actual_type)

    def test_should_get_clean_repo_path(self):
        # arrange
        path = './'
        expected_repo_path = os.getcwd()

        # act
        actual_repo_path = utils.clean_repo_path(path)

        # assert
        self.assertEqual(expected_repo_path, actual_repo_path)

    def test_should_get_clean_repo_path_empty_str(self):
        # arrange
        path = ''
        expected_repo_path = ''

        # act
        actual_repo_path = utils.clean_repo_path(path)

        # assert
        self.assertEqual(expected_repo_path, actual_repo_path)

    def test_should_get_obj_type_name_list_unknown(self):
        # arrange
        obj = [None]
        expected_type = 'list(unknown)'

        # act
        actual_type = utils.get_object_typename(obj)

        # assert
        self.assertEqual(expected_type, actual_type)

    def test_should_get_obj_type_name_bool(self):
        # arrange
        obj = True
        expected_type = 'int'

        # act
        actual_type = utils.get_object_typename(obj)

        # assert
        self.assertEqual(expected_type, actual_type)

    def test_should_check_types_compatibility_int(self):
        # arrange
        data_type = 'int'
        base_data_type = 'int'

        # act
        actual_compatibility = utils.check_types_compatibility(data_type, base_data_type, None)

        # assert
        self.assertTrue(actual_compatibility)

    def test_should_check_types_compatibility_base_list(self):
        # arrange
        data_type = 'list(str)'
        base_data_type = 'list'

        # act
        actual_compatibility = utils.check_types_compatibility(data_type, base_data_type, None)

        # assert
        self.assertTrue(actual_compatibility)

    def test_should_check_types_compatibility_base_list_str(self):
        # arrange
        data_type = 'list'
        base_data_type = 'list(str)'

        # act
        actual_compatibility = utils.check_types_compatibility(data_type, base_data_type, None)

        # assert
        self.assertTrue(actual_compatibility)
