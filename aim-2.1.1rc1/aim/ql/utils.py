from typing import Optional, Union

from aim.ql.tree.abstract_syntax_tree import AbstractSyntaxTree
from aim.ql.tree.binary_expression_tree import BinaryExpressionTree
from aim.ql.grammar.expression import Expression
from aim.ql.tokens.token import Token, TokenList


def build_bet(expression: Optional[Union[str,
                                         Token, TokenList,
                                         Expression, BinaryExpressionTree]]
              ) -> BinaryExpressionTree:

    if isinstance(expression, str):
        expression = _parse_expression(expression)
    if isinstance(expression, (Token, TokenList, Expression)):
        bet = _build_bet_from_expression(expression)
    elif expression is None:
        bet = BinaryExpressionTree()
    elif isinstance(expression, BinaryExpressionTree):
        bet = expression
    else:
        raise TypeError('undefined expression type')
    return bet


def match(strict: bool,
          expression: Union[str,
                            Token, TokenList,
                            Expression, BinaryExpressionTree],
          concat_default_expression: Optional[
              Union[str, Token, TokenList,
                    Expression, BinaryExpressionTree]] = None,
          fields: Optional[dict] = None, *add_fields):
    bet = build_bet(expression)
    if bet is None:
        return False

    bet.strict = strict

    if concat_default_expression is not None:
        bet_default = build_bet(concat_default_expression)
        if bet_default is not None:
            bet.concat(bet_default)

    match_res = bet.match(fields, *add_fields)
    return match_res


def _parse_expression(query: str) -> Optional[Union[Token, TokenList]]:
    parser = Expression()
    expression = parser.parse(query)
    return expression.node if hasattr(expression, 'node') else None


def _build_bet_from_expression(expression: Optional[Union[Token,
                                                          TokenList,
                                                          Expression]]
                               ) -> BinaryExpressionTree:
    ast = AbstractSyntaxTree()
    ast.build_from_expression(expression)

    bet = BinaryExpressionTree()
    bet.build_from_ast(ast)
    return bet
