import datetime

from aim.sdk.run import Run
from tests.base import TestBase


class TestRunParamErrorMessages(TestBase):
    def test_unsupported_type_datetime_error_message(self):
        run = Run(system_tracking_interval=None)
        with self.assertRaises(TypeError) as cm:
            run['start'] = datetime.datetime.now()
        exception = cm.exception
        self.assertIn('Cannot store value of type', str(exception))
        self.assertIn('datetime', str(exception))
        self.assertIn('Supported types are', str(exception))

    def test_unsupported_type_custom_class_error_message(self):
        class CustomClass:
            pass

        run = Run(system_tracking_interval=None)
        with self.assertRaises(TypeError) as cm:
            run['param'] = CustomClass()
        exception = cm.exception
        self.assertIn('Cannot store value of type', str(exception))
        self.assertIn('CustomClass', str(exception))
        self.assertIn('Supported types are', str(exception))

    def test_supported_types_work(self):
        run = Run(system_tracking_interval=None)
        run['none_param'] = None
        run['bool_param'] = True
        run['int_param'] = 42
        run['float_param'] = 3.14
        run['str_param'] = 'hello'
        run['bytes_param'] = b'world'
        run['list_param'] = [1, 2, 3]
        run['dict_param'] = {'key': 'value'}

        self.assertIsNone(run['none_param'])
        self.assertTrue(run['bool_param'])
        self.assertEqual(42, run['int_param'])
        self.assertAlmostEqual(3.14, run['float_param'])
        self.assertEqual('hello', run['str_param'])
        self.assertEqual(b'world', run['bytes_param'])
        self.assertEqual([1, 2, 3], run['list_param'])
        self.assertEqual({'key': 'value'}, run['dict_param'])
