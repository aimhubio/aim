class TokenType(tuple):
    parent = None

    def __contains__(self, item):
        return item is not None and (self is item or item[:len(self)] == self)

    def __getattr__(self, name):
        new = TokenType(self + (name,))
        setattr(self, name, new)
        new.parent = self
        return new

    def __repr__(self):
        return 'Token' + ('.' if self else '') + '.'.join(self)


token_type = TokenType()


# - Literals
Literal = token_type.Literal
# -- Primitive
String = Literal.String
Number = Literal.Number
Integer = Number.Integer
Float = Number.Float
Boolean = Literal.Boolean
None_ = Literal.None_
# -- Compound
List = Literal.List

# - Operators
Operator = token_type.Operator
# --
Comparison = Operator.Comparison
Logical = Operator.Logical

# - Identifier
Identifier = token_type.Identifier
Path = Identifier.Path

# - Expression
Expression = token_type.Expression
