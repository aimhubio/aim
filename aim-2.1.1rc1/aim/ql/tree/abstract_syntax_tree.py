from typing import Union, List

from aim.ql.tree.base import Tree
from aim.ql.tokens.token import Token, TokenList
from aim.ql.grammar.expression import Expression


class AbstractSyntaxTree(Tree):
    def build_from_expression(self, expression: Union[Expression,
                                                      Token, TokenList]):
        if isinstance(expression, (Token, TokenList)):
            token = expression
        elif hasattr(expression, 'node'):
            token = expression.node
        else:
            token = None

        if token is not None:
            self.head = self.NODE(token, 0, 0)
            if isinstance(token.value, list):
                self.append_tokens(token.value, self.head)

    def append_tokens(self, tokens: List[Token], parent):
        for idx, token in enumerate(tokens):
            token_node = self.NODE(token, idx, parent.level+1, parent)
            if isinstance(token.value, list):
                self.append_tokens(token.value, token_node)
