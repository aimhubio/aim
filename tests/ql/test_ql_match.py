import unittest

from aim.ql.tree.abstract_syntax_tree import AbstractSyntaxTree
from aim.ql.tree.binary_expression_tree import BinaryExpressionTree
from aim.ql.grammar.expression import Expression


class TestStatementMatch(unittest.TestCase):
    def test_statement_match(self):
        parser = Expression()
        expr = parser.parse('10 == 10 and (10 == 3 or 2 > 1)')

        ast = AbstractSyntaxTree()
        ast.build_from_expression(expr)

        bet = BinaryExpressionTree()
        bet.build_from_ast(ast)

        assert bet.match()
