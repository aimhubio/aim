from pyrser import grammar, meta
from pyrser.hooks import set

from aim.ql.tokens.token import TokenList, Token
from aim.ql.grammar.atom import Atom


class Expression(grammar.Grammar, Atom):
    entry = "input"
    grammar = """
        input = [ expr:>_ eof ]
        
        expr = 
        [
            [
                simple_expr
                | compound_expr
            ]:>_
        ]
        
        compound_expr = 
        [
            [ '(' expr:e ')' ] #set(_, e)
        ]

        simple_expr =
        [
            #is_expr(_)
            [
                operand:a #add_operand(_, a)
                [
                    [ op | logical_op ]:o
                    operand:b #add_operand(_, b, o)
                ]*
            ]
        ]
        
        not_expr =
        [
            #is_expr(_)
            not_op:n operand:b #add_operand(_, b, n)
        ]
        
        operand = 
        [
            [
                not_expr
                | atom
                | compound_expr
                | simple_expr
            ]:>_
        ]
        
        op =
        [
            [
                "=="
                | ">="
                | "<="
                | "<>"
                | "!="
                | '<'
                | '>'
                | ["is" "not"]
                | "is"
                | "in"
                | ["not" "in"]
            ]:o #is_op(_, o)
        ]
        
        logical_op = [ 
            [
                "and"
                | "or"
            ]:o #is_op(_, o)
        ]
        
        not_op = [ 
            "not":n #is_op(_, n)
        ]
    """


@meta.hook(Expression)
def is_expr(self, ast):
    ast.node = TokenList('Expression')
    return True


@meta.hook(Expression)
def add_operand(self, ast, operand, operation=None):
    if operation is not None:
        ast.node.append(operation.node)
    ast.node.append(operand.node)
    return True


@meta.hook(Expression)
def is_op(self, ast, operator):
    value = self.value(operator)
    ast.node = Token(value, 'Operator')
    return True


if __name__ == '__main__':
    parser = Expression()

    print(parser.parse('a == c == b'))
    print(parser.parse('a == (c == b) == k'))
    print(parser.parse('a == (c == b) >= k not in a'))
    print(parser.parse('a == (c == b) >= k not in a'))
    print(parser.parse('a == b and l and (l == o or'
                       ' (c == 4 and p not in (w,2,"s"))) and a not in p'))
    print(parser.parse('not (a not in b) and not l and not (l == o or '
                       '(c == 4 and p not in (w,2,"s"))) and a not in p'))
