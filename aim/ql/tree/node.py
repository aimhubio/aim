from anytree import NodeMixin


class Node(NodeMixin):
    def __init__(self, token, idx, level, parent=None, children=None):
        super(Node, self).__init__()
        self.token = token
        self.idx = idx
        self.level = level
        self.name = token.type

        if parent:
            self.parent = parent
        self.name = '{} {}'.format(self.name, token.value)

        if children:
            self.children = children

    def __repr__(self):
        return self.name

    def get_path(self):
        token_path = '{}.{}'.format(self.level, self.idx)
        if self.parent:
            return '{}/{}'.format(self.parent.get_path(), token_path)
        return token_path
