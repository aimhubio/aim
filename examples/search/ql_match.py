from aim.ql import match


expressions = {
    # Literals
    'True == not False': {},
    '"True" == True': {},
    'None == None': {},
    '10 == 10 and (10 == 3 or 2 > 1)': {},
    '10 == 10 and (10 == 3 or 2 > 1) and 8 < 10': {},
    '10 == 10 and (10 == 3 or 2 < 1)': {},
    '10 == 10 and (10 == 3 or 2 in (1,2))': {},
    '10 == 10 and (10 == 3 or 2 not in (1,2))': {},
    '10 == 10 and (10 == 3 or "a1" in ("a1", "a2", "a3"))': {},
    '10 == 10 and (10 == 3 or a1 in (a1, a2, a3))': {},
    '10 == 10 and (10 == 3 or "a1" in ("a2", "a3"))': {},
    '10 == 10 and (10 == 3 or "1" in "1234")': {},
    'a in (x, y)': {},
    'a in (x, y, a)': {},

    # Fields
    'a == 10': {
        'a': 10,
    },
    'a == 20': {
        'a': 10,
    },
    'a == b': {
        'a': 'b',
        # `b` will be treated as a string
    },
    'a in (foo, bar)': {
        'a': 'foo',
    },
    'a in (foo, bar, baz_id_ok)': {
        'baz_id_ok': 'a',
    },
    'a in (foo, bar, baz_id_err)': {
        'baz_id_err': 'c',
    },
    'a.b.c == 4 and a.b.c in (4,5,6)': {
        'a': {
            'b': {
                'c': 4
            },
        },
    },
    '4 in (a.b.c, 5)': {
        'a': {
            'b': {
                'c': 4
            },
        },
    },
}

l = max(*[len(e) for e in expressions.keys()])

for expr, fields in expressions.items():
    print('`{}` {}|=> {}'.format(expr, ' '*(l-len(expr)), match(True, expr, fields)))
