from aim.ql.parse_tree import SyntacticTree, LogicalExpressionTree


def get_expression_tree_from_stmt(statement: str) -> LogicalExpressionTree:
    s_tree = SyntacticTree()
    s_tree.build_from_statement(statement)

    e_tree = LogicalExpressionTree()
    e_tree.build_from_syntactic_tree(s_tree.head)

    return e_tree
