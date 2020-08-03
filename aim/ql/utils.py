from typing import Optional

from aim.ql.tree.abstract_syntax_tree import AbstractSyntaxTree
from aim.ql.tree.binary_expression_tree import BinaryExpressionTree
from aim.ql.grammar.expression import Expression


def parse(query: str):
    parser = Expression()
    expression = parser.parse(query)
    return expression


def match(query: str, fields: Optional[dict] = None):
    expression = parse(query)

    ast = AbstractSyntaxTree()
    ast.build_from_expression(expression)

    bet = BinaryExpressionTree()
    bet.build_from_ast(ast)

    match_res = bet.match(fields)
    return match_res
