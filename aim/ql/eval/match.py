from aim.ql.eval.utils import get_expression_tree_from_stmt


def match(statement: str, fields: dict) -> bool:
    expression_tree = get_expression_tree_from_stmt(statement)
    return expression_tree.evaluate(expression_tree.head, fields)
