import unittest

from aim.artifacts.metric import Metric
from aim.artifacts.map import NestedMap
from aim.artifacts.utils import validate_mapping, validate_iterable


class TestArtifactValidation(unittest.TestCase):
    def test_validate_mapping(self):
        # Test values
        self.assertEqual(
            validate_mapping({'a': 1, 'b': 2}, (str,), (int, float)),
            (0, None))
        self.assertEqual(
            validate_mapping({'a': 1, 'b': [1, 2]}, (str,), (int, float)),
            (1, [1, 2]))
        self.assertEqual(
            validate_mapping({'a': 1, 'b': [1, 2]}, (str,), (int, float, list)),
            (0, None))
        self.assertEqual(
            validate_mapping({'a': 1, 'b': (1, 2)}, (str,), (int, float, list)),
            (1, (1, 2)))
        self.assertEqual(
            validate_mapping(
                {'a': 1, 'b': {'c': (1, 2)}},
                (str,), (int, float, list)
            ),
            (1, {'c': (1, 2)})
        )
        self.assertEqual(
            validate_mapping(
                {'a': 1, 'b': {'c': (1, 2)}},
                (str,), (int, dict, float, tuple)
            ),
            (0, None)
        )
        self.assertEqual(
            validate_mapping(
                {'a': 1, 'b': {'c': (1, 2, {1: 2})}},
                (str,), (int, dict, float, tuple),
                iterable_validator=lambda v: validate_iterable(v, (int, float))
            ),
            (1, {1: 2})
        )
        self.assertEqual(
            validate_mapping(
                {'a': 1, 'b': {'c': (1, 2, {1: 2})}},
                (str,), (int, dict, float, tuple),
                iterable_validator=lambda v: validate_iterable(v,
                                                               (int,
                                                                float,
                                                                dict))
            ),
            (0, None)
        )
        self.assertEqual(
            validate_mapping(
                {'a': 1, 'b': {'c d': (1, 2, {1: 2})}},
                (str,), (int, dict, float, tuple),
                key_str_validator=r'^[a-z]+$',
                iterable_validator=lambda v: validate_iterable(v,
                                                               (int,
                                                                float,
                                                                dict))
            ),
            (2, 'c d')
        )
        self.assertEqual(
            validate_mapping(
                {'a': 1, 'b': {'c d': (1, 2, {1: 2})}},
                (str,), (int, dict, float, tuple),
                key_str_validator=r'^[a-z\s]+$',
                iterable_validator=lambda v: validate_iterable(v,
                                                               (int,
                                                                float,
                                                                dict))
            ),
            (0, None)
        )
        self.assertEqual(
            validate_mapping(
                {('foo', 'bar'): 1, 'b': {'c d': (1, 2, {1: 2})}},
                (str,), (int, dict, float, tuple),
                key_str_validator=r'^[a-z\s]+$',
                iterable_validator=lambda v: validate_iterable(v,
                                                               (int,
                                                                float,
                                                                dict))
            ),
            (1, ('foo', 'bar'))
        )
        self.assertEqual(
            validate_mapping(
                {('foo', 'bar'): 1, 'b': {'c d': (1, 2, {1: 2})}},
                (str, tuple), (int, dict, float, tuple),
                key_str_validator=r'^[a-z\s]+$',
                iterable_validator=lambda v: validate_iterable(v,
                                                               (int,
                                                                float,
                                                                dict))
            ),
            (0, None)
        )

    def test_metric_artifact_validation(self):
        # Test name and value validation
        Metric(name='foo', value=1)
        self.assertRaises(ValueError, Metric, name='foo bar', value=1)
        self.assertRaises(ValueError, Metric, name='2foo', value=1)
        self.assertRaises(TypeError, Metric, name='foo', value='1')

        # Test context validation
        Metric(name='foo', value=1,
               foo='A', bar=True, baz=3.14, none_val=None,
               subset=(1, 2, 3,))
        self.assertRaises(TypeError, Metric,
                          name='foo', value=1,
                          subset={1: 2})
        self.assertRaises(TypeError, Metric,
                          name='foo', value=1,
                          subset=[1, 2])
        self.assertRaises(TypeError, Metric,
                          name='foo', value=1,
                          subset={1, 2, 3})

    def test_map_artifact_validation(self):
        # Test name validation
        NestedMap({'a': 1}, namespace='default')
        self.assertRaises(ValueError, NestedMap, {'a': 1},
                          namespace='default 12')
        self.assertRaises(ValueError, NestedMap, {'a': 1},
                          namespace='12default')

        # Test value validation
        NestedMap({
            'foo': 1,
            'foo_1': 1.2,
            'foo_2': '1.2',
            'foo_3': [1, 2, 3],
            'foo_4': (1, 2, 3),
            'foo_5': {
                'bar': 1,
                'bar_2': [1, 2, 3],
                'bar_3': {
                    'baz': True,
                }
            },
            'foo_6': True,
            'foo_7': None,
        }, namespace='default')
        self.assertRaises(TypeError, NestedMap, {
            'foo foo': 1,
        }, namespace='default')
        self.assertRaises(TypeError, NestedMap, {
            '2foo': 1,
        }, namespace='default')
        self.assertRaises(TypeError, NestedMap, {
            '_foo кирилица': 1,
        }, namespace='default')
        self.assertRaises(TypeError, NestedMap, {
            1: 1,
        }, namespace='default')
        self.assertRaises(TypeError, NestedMap, {
            True: 1,
        }, namespace='default')
        self.assertRaises(TypeError, NestedMap, {
            None: 1,
        }, namespace='default')
        self.assertRaises(TypeError, NestedMap, {
            'foo': 1,
            'foo_1': 1.2,
            'foo_2': '1.2',
            'foo_3': {1, 2, 3},
            'foo_4': (1, 2, 3),
            'foo_5': {
                'bar': 1,
                'bar_2': {
                    'baz': True,
                }
            },
            'foo_6': True,
            'foo_7': None,
        }, namespace='default')


if __name__ == '__main__':
    unittest.main()
