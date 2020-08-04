from aim.ql.tree.base import Tree
from aim.ql.tree.abstract_syntax_tree import AbstractSyntaxTree


class BinaryExpressionTree(Tree):
    def build_from_ast(self, tree: AbstractSyntaxTree):
        self.head = self._build_tree(tree.head)

    def match(self, fields: dict = {}, *add_fields):
        return self._evaluate(self.head, fields, *add_fields)

    @classmethod
    def _evaluate(cls, tree, fields: dict, *add_fields) -> bool:
        left_eval = right_eval = None
        if len(tree.children) > 0:
            left_eval = cls._evaluate(tree.children[0], fields, *add_fields)
        if len(tree.children) > 1:
            right_eval = cls._evaluate(tree.children[1], fields, *add_fields)

        if cls.is_node_logical_operator(tree, 'and'):
            return left_eval and right_eval
        elif cls.is_node_logical_operator(tree, 'or'):
            return left_eval or right_eval
        elif cls.is_node_logical_operator(tree, 'not'):
            return not left_eval

        try:
            if cls.is_node_comparison_operator(tree, '=='):
                return left_eval == right_eval
            elif cls.is_node_comparison_operator(tree, '!='):
                return left_eval != right_eval
            elif cls.is_node_comparison_operator(tree, '>='):
                return left_eval >= right_eval
            elif cls.is_node_comparison_operator(tree, '<='):
                return left_eval <= right_eval
            elif cls.is_node_comparison_operator(tree, '>'):
                return left_eval > right_eval
            elif cls.is_node_comparison_operator(tree, '<'):
                return left_eval < right_eval
            elif cls.is_node_comparison_operator(tree, 'is'):
                return left_eval is right_eval
            elif cls.is_node_comparison_operator(tree, 'in'):
                return left_eval in right_eval
            elif cls.is_node_comparison_operator(tree, 'not in'):
                return left_eval not in right_eval
        except:
            return False

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
