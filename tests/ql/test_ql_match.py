import unittest

from aim.ql import match


class TestStatementMatch(unittest.TestCase):
    def test_statement_match(self):
        expressions = {
            # Literals
            'True == not False': ({}, True),
            '"True" == True': ({}, False),
            'None == None': ({}, True),
            'a == "a"': ({}, True),
            'b == "b"': ({'b': 1}, False),
            '10 == 10 and (10 == 3 or 2 > 1)': ({}, True),
            '10 == 10 and (10 == 3 or 2 > 1) and 8 < 10': ({}, True),
            '10 == 10 and (10 == 3 or 2 < 1)': ({}, False),
            '10 == 10 and ((10 == 3) or 2 in (1,2))': ({}, True),
            '10 == 10 and (10 == 3 or (2 not in (1,2)))': ({}, False),
            '10 == 10 and (10 == 3 or "a1" in ("a1", "a2", "a3"))': ({}, True),
            '10 == 10 and (10 == 3 or a1 in (a1, a2, a3))': ({}, True),
            '10 == 10 and (10 == 3 or "a1" in ("a2", "a3"))': ({}, False),
            '(10 == 10 and (10 == 3 or "1" in "1234"))': ({}, True),
            '(a in (x, y)) and False == False': ({}, False),
            'a in (x, y, a)': ({}, True),

            # NoneTypes
            'None is None': ({}, True),
            'a is not None': ({}, True),
            'b is not None': ({'b': None}, False),
            'c is not None': ({'c': 10}, True),
            'a.a is None': ({}, True),
            'a is None': ({}, False),
            'b is None': ({'b': None}, True),
            'a is b': ({'b': None}, False),
            'a.a is b': ({'b': None}, True),
            'b is c': ({'b': None, 'c': None}, True),
            'a.b.c is 1': ({'a': None}, False),
            'a.b.d is 1': ({'a': {'b': {'d': 1}}}, True),

            # Fields
            'a == 10': ({
                'a': 10,
            }, True),
            'a == 20': ({
                'a': 10,
            }, False),
            'a == b': ({
                'a': 'b',
                # `b` will be treated as a string
            }, True),
            'a in (foo, bar)': ({
                'a': 'foo',
            }, True),
            'a in (foo, bar, baz_id_ok)': ({
                'baz_id_ok': 'a',
            }, True),
            'a in (foo, bar, baz_id_err)': ({
                'baz_id_err': 'c',
            }, False),
            'a.b.c == 4 and a.b.c in (4,5,6)': ({
                'a': {
                    'b': {
                        'c': 4
                    },
                },
            }, True),
            '4 not in (a.b.c, 5)': ({
                'a': {
                    'b': {
                        'c': 4
                    },
                },
            }, False),

            # Nested parenthesis
            '(10 == 10) and 5 == 5':
                ({}, True),
            '(((((10 == 10) and 5 == 5))))':
                ({}, True),
            '(10 == 10) and (((c == c))) and ((5 == 5) or p == p)':
                ({}, True),
            '10 == 10 and (((c == c))) and ((5 == 5) or p == p)':
                ({}, True),
            '(10 == 10 and (((c == c))) and ((5 == 5) or p != p))':
                ({}, True),
            '(10 == 10 and (((c == c))) and ((5 != 5) or p != p))':
                ({}, False),
            '((10 == 10 and (((c == c)))) and ((5 == 5) or p == p))':
                ({}, True),
            '((10 != 10 and (((c == c)))) and ((5 == 5) or p == p))':
                ({}, False),
            'n == n and ((10 == 10 and (((c == c)))) and ((5 == 5) or p == p))':
                ({}, True),
            'm == 8 and ((10 == 10 and (((c == c)))) and ((5 == 5) or p == p))':
                ({'m': 8}, True),
            'm == m and ((10 == 10 and (((c == 1)))) and ((5 == 5) or p == p))':
                ({'c': 2}, False),
        }

        for expr, fields in expressions.items():
            assert match(True, expr, None, fields[0]) == fields[1]

    def test_statement_match_with_default(self):
        expressions = [
            ('(10 == 10 and (10 == 3 or "1" in "1234"))', '1 == 1', {}, True),
            ('(10 == 10 and (10 == 3 or "1" in "1234"))', '1 != 1', {}, False),
            ('(a == 10 and (10 == 3 or "1" in "1234"))', 'b != 1', {
                'a': 10,
                'b': 2,
            }, True),
            ('(a == 10 and (10 == 3 or "1" in "1234")) or 1 == 10', 'b == 1', {
                'a': 10,
                'b': 2,
            }, False),
        ]

        for expr in expressions:
            assert match(True, expr[0], expr[1], expr[2]) == expr[3]
