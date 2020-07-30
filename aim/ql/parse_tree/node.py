from anytree import NodeMixin


class Node(NodeMixin):
    def __init__(self, token, idx, level, parent=None, children=None):
        super(Node, self).__init__()
        self.token = token
        self.idx = idx
        self.level = level
        self.name = self.get_cls()
        if parent:
            self.parent = parent
            # self.name = '{}/{}'.format(self.parent.get_cls(), self.name)
        # self.name = '{} {}'.format(self.name, self.get_path())
        self.name = '{} {}'.format(self.name, self.get_value())
        if children:
            self.children = children

    def __repr__(self):
        return self.name

    def get_path(self):
        token_path = '{}.{}'.format(self.level, self.idx)
        if self.parent:
            return '{}/{}'.format(self.parent.get_path(), token_path)
        return token_path

    def get_cls(self):
        return self.token.ttype or type(self.token).__name__

    def get_value(self):
        return self.token.value if self.token else None
