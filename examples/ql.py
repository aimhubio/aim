from aim.ql import eval
from aim.ql.parse_tree import LogicalExpressionTree, SyntacticTree

# stmt = 'where a=1.01 and (k.dw=3 and p!="1" and (b=2)) or (p="23ko0=-2d")'
# stmt = 'where (a >= 3) and c !=   "1" and k=2 and (x=10 or z="23asd,_")'
stmt = 'where k=2 and a.b = 1 and a.c > 3 and'

res = eval.match(stmt, {
    'k': 2,
    'a': {
        'b': 1,
        'c': 4,
    },
})

print(res)
