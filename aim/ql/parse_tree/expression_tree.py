import jmespath

from aim.ql.parse_tree.base import Tree
from aim.ql.lexer.utils import remove_quotes


class LogicalExpressionTree(Tree):
    def build_from_syntactic_tree(self, tree):
        self.head = self.append_subtree(tree)

    @classmethod
    def append_subtree(cls, subtree):
        if isinstance(subtree, (list, tuple)):
            if len(subtree) == 1:
                return cls.append_subtree(subtree[0])

            head = None
            left_nodes = []
            right_nodes = []
            for node in subtree:
                if head is None and cls.is_node_logical_operator(node):
                    head = node
                else:
                    if cls.is_node_parentheses(node) \
                            or cls.is_node_comparison(node) \
                            or cls.is_node_logical_operator(node):
                        if head is None:
                            left_nodes.append(node)
                        else:
                            right_nodes.append(node)

            if len(left_nodes) > 0:
                left_subtree = cls.append_subtree(left_nodes)
                if left_subtree is not None:
                    if head is not None:
                        left_subtree.parent = head
                    else:
                        return left_subtree
            if len(right_nodes) > 0:
                right_subtree = cls.append_subtree(right_nodes)
                if right_subtree is not None:
                    if head is not None:
                        right_subtree.parent = head
                    else:
                        return right_subtree

            return head

        if cls.is_node_parentheses(subtree):
            return cls.append_subtree(list(subtree.children))

        if cls.is_node_statement(subtree):
            return cls.append_subtree(subtree.children[0])

        if cls.is_node_where(subtree):
            return cls.append_subtree(subtree.children)

        return subtree

    def evaluate(self, subtree, fields: dict):
        if subtree is None:
            return 0

        if self.is_node_comparison(subtree):
            return self.evaluate_comparison(subtree, fields)

        if self.is_node_logical_operator(subtree):
            left_eval = right_eval = None
            if len(subtree.children) > 0:
                left_eval = self.evaluate(subtree.children[0], fields)
            if len(subtree.children) > 1:
                right_eval = self.evaluate(subtree.children[1], fields)

            if self.is_node_logical_operator(subtree, 'and'):
                if left_eval is not None and right_eval is not None:
                    return left_eval and right_eval
                else:
                    raise ValueError('failed to parse the query')
            if self.is_node_logical_operator(subtree, 'or'):
                if left_eval is not None and right_eval is not None:
                    return left_eval or right_eval
                else:
                    raise ValueError('failed to parse the query')

    def evaluate_comparison(self, comparison, fields) -> bool:
        field = operator = value = None
        for c in comparison.children:
            if self.is_node_identifier(c):
                node_val = self.get_comparison_identifier_value(c)
                if field is None:
                    field = node_val
                else:
                    value = node_val
            elif self.is_node_var(c):
                node_val = self.get_comparison_var_value(c)
                if field is None:
                    field = node_val
                else:
                    value = node_val
            elif self.is_node_comparison_operator(c):
                operator = c

        try:
            field_val = jmespath.search(field, fields)
        except:
            raise KeyError('field key not found')

        if self.is_node_comparison_operator(operator, '='):
            return field_val == value
        if self.is_node_comparison_operator(operator, '!='):
            return field_val != value
        elif self.is_node_comparison_operator(operator, '<'):
            return field_val < value
        elif self.is_node_comparison_operator(operator, '<='):
            return field_val <= value
        elif self.is_node_comparison_operator(operator, '>'):
            return field_val > value
        elif self.is_node_comparison_operator(operator, '>='):
            return field_val >= value
        else:
            raise TypeError('unknown comparison operator')

    def get_comparison_identifier_value(self, identifier):
        val = ''
        for i in identifier.children:
            if self.is_node_name(i) or self.is_node_string(i):
                val += remove_quotes(str(i.get_value()))
            elif self.is_node_punctuation(i, '.'):
                val += '.'
        return val

    def get_comparison_var_value(self, identifier):
        if self.is_node_int(identifier):
            return int(identifier.get_value())
        elif self.is_node_float(identifier):
            return float(identifier.get_value())
        elif self.is_node_name(identifier) or self.is_node_string(identifier):
            return remove_quotes(str(identifier.get_value()))
        else:
            raise TypeError('unknown identifier type')
