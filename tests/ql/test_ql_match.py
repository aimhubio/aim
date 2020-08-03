import unittest

from aim.ql import match


class TestStatementMatch(unittest.TestCase):
    def test_statement_match(self):
        expressions = {
            # Literals
            'True == not False': ({}, True),
            '"True" == True': ({}, False),
            'None == None': ({}, True),
            '10 == 10 and (10 == 3 or 2 > 1)': ({}, True),
            '10 == 10 and (10 == 3 or 2 > 1) and 8 < 10': ({}, True),
            '10 == 10 and (10 == 3 or 2 < 1)': ({}, False),
            '10 == 10 and (10 == 3 or 2 in (1,2))': ({}, True),
            '10 == 10 and (10 == 3 or 2 not in (1,2))': ({}, False),
            '10 == 10 and (10 == 3 or "a1" in ("a1", "a2", "a3"))': ({}, True),
            '10 == 10 and (10 == 3 or a1 in (a1, a2, a3))': ({}, True),
            '10 == 10 and (10 == 3 or "a1" in ("a2", "a3"))': ({}, False),
            '10 == 10 and (10 == 3 or "1" in "1234")': ({}, True),
            'a in (x, y)': ({}, False),
            'a in (x, y, a)': ({}, True),

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
        }

        for expr, fields in expressions.items():
            assert match(expr, fields[0]) == fields[1]
