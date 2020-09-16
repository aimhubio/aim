import os
from typing import Optional

from anytree import RenderTree
from anytree.exporter import UniqueDotExporter

from aim.ql.tree.node import Node
from aim.ql.tokens.types import *


class Tree(object):
    NODE = Node

    def __init__(self):
        self.head = None

    def __str__(self):
        if self.empty():
            return 'Empty {}'.format(type(self).__name__)
        return str(RenderTree(self.head))

    def __bool__(self):
        return self.head is not None

    def empty(self) -> bool:
        return self.head is None

    def export(self, path: str, name: str = 'tree.png'):
        if self.empty():
            return
        UniqueDotExporter(self.head).to_picture(os.path.join(path, name))

    @classmethod
    def check_node_type(cls, node: NODE, node_type: TokenType) -> bool:
        if not isinstance(node, cls.NODE) \
                or not hasattr(node, 'token'):
            return False
        return node.token.type == node_type

    @classmethod
    def is_node_expression(cls, node: NODE) -> bool:
        return cls.check_node_type(node, Expression)

    @classmethod
    def is_node_operator(cls, node: NODE,
                         operator: Optional[str] = None) -> bool:
        return cls.is_node_logical_operator(node, operator) \
               or cls.is_node_comparison_operator(node, operator)

    @classmethod
    def is_node_logical_operator(cls, node: NODE,
                                 operator: Optional[str] = None) -> bool:
        type_check = cls.check_node_type(node, Logical)
        if operator is None:
            return type_check
        else:
            return type_check and node.token.value == operator

    @classmethod
    def is_node_comparison_operator(cls, node: NODE,
                                    operator: Optional[str] = None) -> bool:
        type_check = cls.check_node_type(node, Comparison)
        if operator is None:
            return type_check
        else:
            return type_check and node.token.value == operator

    @classmethod
    def is_node_identifier(cls, node, path: bool = True) -> bool:
        if path:
            return cls.check_node_type(node, Identifier) \
                   or cls.check_node_type(node, Path)
        else:
            return cls.check_node_type(node, Identifier)
