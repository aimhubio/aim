from typing import Optional

from aim.ql.tree.abstract_syntax_tree import AbstractSyntaxTree
from aim.ql.tree.binary_expression_tree import BinaryExpressionTree
from aim.ql.grammar.expression import Expression
from aim.ql.tokens.token import Token, TokenList


def parse(query: str):
    parser = Expression()
    expression = parser.parse(query)
    return expression


def match(statement: str, fields: Optional[dict] = None, *add_fields):
    if isinstance(statement, str):
        expression = parse(statement)
    elif isinstance(statement, (Token, TokenList)):
        expression = statement
    else:
        raise TypeError('undefined statement type')

    ast = AbstractSyntaxTree()
    ast.build_from_expression(expression)

    bet = BinaryExpressionTree()
    bet.build_from_ast(ast)

    match_res = bet.match(fields, add_fields)
    return match_res
