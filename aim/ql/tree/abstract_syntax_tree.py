from aim.ql.parse_tree.base import Tree
from aim.ql.lexer import parse


class AbstractSyntaxTree(Tree):
    def build_from_statement(self, statement):
        tokens = parse(statement)[0]
        self.head = self.NODE(tokens, 0, 0)
        self.append_tokens(tokens, self.head)

    def append_tokens(self, tokens, parent):
        for idx, token in enumerate(tokens):
            token_node = self.NODE(token, idx, parent.level+1, parent)
            if isinstance(token.value, list):
                self.append_tokens(token.tokens, token_node)
