from aim.ql import match


res = match(False, 'a == 10 and (12 > 0 or 5 == 4)', 'b == 10', {
    'a': 10,
    'b': 10,
})

print(res)
