from pyrser import grammar, meta

from aim.ql.grammar.expression import Expression


class Statement(grammar.Grammar, Expression):
    entry = "input"
    grammar = """
        input = [ statement:s #set_stmt(_, s)  eof ]
        
        statement = 
        [
            #is_stmt(_)
            [ id | string ]:s #set_name(_, s)
            [ ',' [ id | string ]:s #set_name(_, s) ]*
            [ "where" | "if" ]
            expr:e #set_expr(_, e)
            ';'?
        ]
    """


@meta.hook(Expression)
def set_stmt(self, ast, stmt):
    ast.node = stmt.node
    return True


@meta.hook(Expression)
def is_stmt(self, ast):
    ast.node = {
        'select': [],
        'expression': None
    }
    return True


@meta.hook(Expression)
def set_name(self, ast, name):
    ast.node['select'].append(self.value(name).strip().strip('"'))
    return True


@meta.hook(Expression)
def set_expr(self, ast, expr):
    ast.node['expression'] = expr.node
    return True
