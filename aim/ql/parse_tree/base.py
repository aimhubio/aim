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

    @classmethod
    def check_node_type(cls, node, node_type) -> bool:
        if not isinstance(node, cls.NODE) \
                or not hasattr(node, 'token'):
            return False
        return str(node.get_cls()) == node_type

    @classmethod
    def is_node_logical_operator(cls, node, operator=None) -> bool:
        type_check = cls.check_node_type(node, 'Token.Operator.Logical')
        if operator is None:
            return type_check
        else:
            return type_check and node.get_value().upper() == operator.upper()

    @classmethod
    def is_node_comparison_operator(cls, node, operator=None) -> bool:
        type_check = cls.check_node_type(node, 'Token.Operator.Comparison')
        if operator is None:
            return type_check
        else:
            return type_check and node.get_value() == operator

    @classmethod
    def is_node_name(cls, node) -> bool:
        return cls.check_node_type(node, 'Token.Name')

    @classmethod
    def is_node_punctuation(cls, node, punct=None) -> bool:
        type_check = cls.check_node_type(node, 'Token.Punctuation')
        if punct is None:
            return type_check
        else:
            return type_check and node.get_value() == punct

    @classmethod
    def is_node_string(cls, node) -> bool:
        return cls.check_node_type(node, 'Token.Literal.String.Symbol') \
               or cls.check_node_type(node, 'Token.Literal.String.Single')

    @classmethod
    def is_node_int(cls, node) -> bool:
        return cls.check_node_type(node, 'Token.Literal.Number.Integer')

    @classmethod
    def is_node_float(cls, node) -> bool:
        return cls.check_node_type(node, 'Token.Literal.Number.Float')

    @classmethod
    def is_node_var(cls, node) -> bool:
        return cls.is_node_string(node) \
               or cls.is_node_name(node) \
               or cls.is_node_int(node) \
               or cls.is_node_float(node)

    @classmethod
    def is_node_parentheses(cls, node) -> bool:
        return cls.check_node_type(node, 'Parenthesis')

    @classmethod
    def is_node_comparison(cls, node) -> bool:
        return cls.check_node_type(node, 'Comparison')

    @classmethod
    def is_node_identifier(cls, node) -> bool:
        return cls.check_node_type(node, 'Identifier')

    @classmethod
    def is_node_statement(cls, node) -> bool:
        return cls.check_node_type(node, 'Statement')

    @classmethod
    def is_node_where(cls, node) -> bool:
        return cls.check_node_type(node, 'Where')
