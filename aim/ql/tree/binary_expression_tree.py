from typing import Callable, List, Tuple, Any

from aim.ql.tree.base import Tree
from aim.ql.tree.abstract_syntax_tree import AbstractSyntaxTree
from aim.ql.tokens.token import Token


class BinaryExpressionTree(Tree):
    def __init__(self):
        super(BinaryExpressionTree, self).__init__()
        self.strict = True

        # type: List[Tuple[Callable[[Token], bool], Callable[[Token], Any]]]
        self.path_modifiers = []

    def build_from_ast(self, tree: AbstractSyntaxTree):
        if tree.head is not None:
            self.head = self._build_tree(tree.head)

    def match(self, fields: dict = {}, *add_fields):
        if self.head is not None:
            return bool(self._evaluate(self.head, fields, *add_fields))
        return True

    def concat(self, other_bet: 'BinaryExpressionTree'):
        if self.head is not None:
            and_token = Token('and', 'Operator')
            curr_tree_head = self.head
            self.head = self.NODE(and_token, 0, 0)
            # FIXME: Increment levels of nodes of subtrees
            self.head.children = [curr_tree_head, other_bet.head]
        else:
            self.head = other_bet.head

    def dump_path_modifiers(self):
        self.path_modifiers = []

    def add_path_modifier(self,
                          path_pattern_checker: Callable[[Token], bool],
                          modifier: Callable[[Token], Any]):
        self.path_modifiers.append((path_pattern_checker, modifier))

    def _evaluate(self, tree, fields: dict, *add_fields) -> bool:
        left_eval = right_eval = None
        if len(tree.children) > 0:
            left_eval = self._evaluate(tree.children[0], fields, *add_fields)
            if self.strict is False:
                left_eval = self.normalize_type(left_eval)
        if len(tree.children) > 1:
            right_eval = self._evaluate(tree.children[1], fields, *add_fields)
            if self.strict is False:
                right_eval = self.normalize_type(right_eval)

        if self.is_node_logical_operator(tree, 'and'):
            return left_eval and right_eval
        elif self.is_node_logical_operator(tree, 'or'):
            return left_eval or right_eval
        elif self.is_node_logical_operator(tree, 'not'):
            return not left_eval

        try:
            if self.is_node_comparison_operator(tree, '=='):
                return left_eval == right_eval
            elif self.is_node_comparison_operator(tree, '!='):
                return left_eval != right_eval
            elif self.is_node_comparison_operator(tree, '>='):
                return left_eval >= right_eval
            elif self.is_node_comparison_operator(tree, '<='):
                return left_eval <= right_eval
            elif self.is_node_comparison_operator(tree, '>'):
                return left_eval > right_eval
            elif self.is_node_comparison_operator(tree, '<'):
                return left_eval < right_eval
            elif self.is_node_comparison_operator(tree, 'is'):
                return left_eval is right_eval
            elif self.is_node_comparison_operator(tree, 'is not'):
                return left_eval is not right_eval
            elif self.is_node_comparison_operator(tree, 'in'):
                return left_eval in right_eval
            elif self.is_node_comparison_operator(tree, 'not in'):
                return left_eval not in right_eval
        except:
            return False

        for path_pattern_checker, path_modifier in self.path_modifiers:
            if path_pattern_checker(tree.token) is True:
                val = path_modifier(tree.token)
                break
        else:
            val = tree.token.get_cleaned_value(fields, *add_fields)

        return val

    @classmethod
    def _build_tree(cls, tree):
        if cls.is_node_expression(tree):
            return cls._build_tree(list(tree.children))

        if isinstance(tree, list):
            if len(tree) == 1:
                return cls._build_tree(tree[0])

            (
                left_nodes,
                head,
                right_nodes
            ) = cls._separate_nodes(tree, cls.is_node_logical_operator)

            # No logical operator exists
            if head is None:
                (
                    left_nodes,
                    head,
                    right_nodes
                ) = cls._separate_nodes(tree, cls.is_node_comparison_operator)

            if len(left_nodes) > 0:
                left_subtree = cls._build_tree(left_nodes)
                if left_subtree is not None:
                    if head is not None:
                        left_subtree.parent = head
                    else:
                        return left_subtree
            if len(right_nodes) > 0:
                right_subtree = cls._build_tree(right_nodes)
                if right_subtree is not None:
                    if head is not None:
                        right_subtree.parent = head
                    else:
                        return right_subtree
            return head

        return tree

    @classmethod
    def _separate_nodes(cls, tree, operator_check: callable, order: int = 1):
        if isinstance(tree, list):
            head = None
            left_nodes = []
            right_nodes = []
            for node in tree[::order]:
                if head is None and operator_check(node):
                    head = node
                else:
                    if head is None:
                        left_nodes.append(node)
                    else:
                        right_nodes.append(node)
            return left_nodes, head, right_nodes

    @staticmethod
    def normalize_type(val):
        if isinstance(val, str):
            if val == 'True':
                return True
            elif val == 'False':
                return False
            elif val == 'None':
                return None

            try:
                val = int(val)
            except:
                try:
                    val = float(val)
                except:
                    pass
        return val
