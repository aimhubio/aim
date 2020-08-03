import os

from anytree import RenderTree
from anytree.exporter import UniqueDotExporter

from aim.ql.parse_tree.node import Node


class Tree(object):
    NODE = Node

    def __init__(self):
        self.head = None

    def __str__(self):
        if self.empty():
            return 'Empty {}'.format(type(self).__name__)
        return str(RenderTree(self.head))

    def empty(self) -> bool:
        return self.head is None

    def export(self, path, name='tree.png'):
        if self.empty():
            return
        UniqueDotExporter(self.head).to_picture(os.path.join(path, name))
