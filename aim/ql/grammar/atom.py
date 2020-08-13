from pyrser import grammar, meta

from aim.ql.tokens.token import TokenList, Token


class Atom(grammar.Grammar):
    entry = "input"
    grammar = """
        input = [ atom:>_ eof ]

        atom =
        [
            [
                number
                | list
                | path
            ]:>_
            |
            [
                "True":l #is_literal(_, l, 'Boolean')
                | "False":l #is_literal(_, l, 'Boolean')
                | "None":l #is_literal(_, l, 'None')
                | id:i #is_identifier(_, i)
                | string:l #is_literal(_, l, 'String')
            ]
        ]

        path = 
        [ 
            #is_path(_) 
            [
                id:i #append_identifier(_, i) 
                [ '.' id:i #append_identifier(_, i) ]+ 
            ]
        ]

        list =
        [ 
            [ 
                '[' #is_list(_) 
                    atom:a #append_atom(_, a) [',' atom:a #append_atom(_, a)]* 
                ']'
            ]
            |
            [
                '(' #is_list(_) 
                    atom:a #append_atom(_, a) ',' 
                ')'
            ]
            |
            [
                '(' #is_list(_)
                    atom:a #append_atom(_, a) 
                    [',' atom:a #append_atom(_, a)]+
                ')'
            ]
        ]
        
        number = 
        [ 
            @ignore("null") 
            [
                int frac? exp?
            ]:l #is_literal(_, l, 'Number') 
        ]

        int = [ '-'? [ digit1_9s | digit ] ]
        frac = [ '.' digits ]
        exp = [ e digits ]
        digit = [ '0'..'9' ]
        digit1_9 = [ '1'..'9' ]
        digits = [ digit+ ]
        digit1_9s = [ digit1_9 digits]
        e = [ ['e'|'E'] ['+'|'-']? ]
    """


@meta.hook(Atom)
def is_literal(self, ast, lit, ltype):
    value = self.value(lit)
    ast.node = Token(value, ltype)
    return True


@meta.hook(Atom)
def is_identifier(self, ast, identifier):
    value = self.value(identifier)
    ast.node = Token(value, 'Identifier')
    return True


# Compound literals
@meta.hook(Atom)
def is_list(self, ast):
    ast.node = TokenList('List')
    return True


@meta.hook(Atom)
def is_path(self, ast):
    ast.node = TokenList('Path')
    return True


@meta.hook(Atom)
def append_atom(self, ast, item):
    ast.node.append(item.node)
    return True


@meta.hook(Atom)
def append_identifier(self, ast, item):
    value = self.value(item)
    node = Token(value, 'Identifier')
    ast.node.append(node)
    return True


if __name__ == '__main__':
    parser = Atom()

    print(parser.parse('12'))
    print(parser.parse('1.2'))
    print(parser.parse('asdasd'))
    print(parser.parse('asdasd.asd'))
    print(parser.parse('"asdasd.asd"'))
    print(parser.parse('"True"'))
    print(parser.parse('True'))
    print(parser.parse('None'))
    print(parser.parse('[1, 2]'))
    print(parser.parse('(1, 2)'))
    print(parser.parse('([1,2, "str"], 2)'))
