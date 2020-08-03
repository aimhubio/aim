from aim.ql.tree.abstract_syntax_tree import AbstractSyntaxTree
from aim.ql.tree.binary_expression_tree import BinaryExpressionTree
from aim.ql.grammar.expression import Expression


parser = Expression()
expr = parser.parse('10 == 10 and (10 == 3 or 2>1)')

ast = AbstractSyntaxTree()
ast.build_from_expression(expr)
ast.export('./img', 'ql-ast.png')
print(ast)
print('=' * 75)

bet = BinaryExpressionTree()
bet.build_from_ast(ast)
bet.export('./img', 'ql-bet.png')
print(bet)
print('=' * 75)

match_res = bet.match({
    'a': 10,
})
print('Match: ', match_res)
