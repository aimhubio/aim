import unittest

from aim.ql import match


class TestStatementMatch(unittest.TestCase):
    def test_statement_match(self):
        assert match('where a=1', {
            'a': 1
        })

        assert match('where a=1 and b=2', {
            'a': 1,
            'b': 2,
        })

        assert match('where a.b=1 and a.c > 2 and a.d != 3 and z="str"', {
            'a': {
                'b': 1,
                'c': 3,
                'd': 2,
            },
            'z': 'str',
        })

        assert not match('where a.b=1 and a.c > 2 and a.d != 3 and z="str"', {
            'a': {
                'b': 1,
                'c': 2,
                'd': 2,
            },
            'z': 'str',
        })

        assert match('where a=1 and (b=2 or c=3)', {
            'a': 1,
            'b': 2,
            'c': 1,
        })

        assert match('where a=1 and (b=2 or c=3)', {
            'a': 1,
            'b': 1,
            'c': 3,
        })

        assert not match('where a=1 and (b=2 or c=3)', {
            'a': 1,
            'b': 1,
            'c': 1,
        })

        assert match('where a=1 and b="str"', {
            'a': 1,
            'b': 'str',
        })

        assert match('where a=1 and b=str', {
            'a': 1,
            'b': 'str',
        })

        assert match('where a=1 and b="str#$%^&_$%^"', {
            'a': 1,
            'b': 'str#$%^&_$%^',
        })

        assert match("where a=1 and b='str'", {
            'a': 1,
            'b': 'str',
        })

        assert not match('where a=1 and b="str"', {
            'a': 1,
            'b': '"str"',
        })

        assert match(
            (
             'where '
             '  a > 1 '
             'and (b <= 2 and c !=3) '
             'and ('
             '  d=3 or e < 4 or (m = 10 and n = "ok")'
             ')'
             ),
            {
                'a': 2,
                'b': 1,
                'c': 2,
                'd': 2,
                'e': 5,
                'm': 10,
                'n': 'ok',
            }
        )

        assert not match(
            (
             'where '
             '  a > 1 '
             'and (b <= 2 and c !=3) '
             'and ('
             '  d=3 or e < 4 or (m = 10 and n = "ok")'
             ')'
             ),
            {
                'a': 2,
                'b': 1,
                'c': 2,
                'd': 2,
                'e': 5,
                'm': 10,
                'n': 'err',
            }
        )
