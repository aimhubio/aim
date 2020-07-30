from aim.ql.lexer.filter import FilterStack


def parse(query, encoding=None):
    stack = FilterStack()
    stack.enable_grouping()
    return tuple(stack.run(query, encoding))


def flatten(stmt):
    if hasattr(stmt, 'tokens'):
        return flatten(stmt.tokens)
    elif isinstance(stmt, list):
        if len(stmt) > 0:
            item = flatten(stmt[1:])
            if item:
                return flatten(stmt[0]) + item
            else:
                return flatten(stmt[0])
    return [stmt] if stmt else None
