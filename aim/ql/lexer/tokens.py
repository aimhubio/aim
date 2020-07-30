class _TokenType(tuple):
    parent = None

    def __contains__(self, item):
        return item is not None and (self is item or item[:len(self)] == self)

    def __getattr__(self, name):
        new = _TokenType(self + (name,))
        setattr(self, name, new)
        new.parent = self
        return new

    def __repr__(self):
        # self can be False only if its the `root` i.e. Token itself
        return 'Token' + ('.' if self else '') + '.'.join(self)


Token = _TokenType()

# Special token types
Text = Token.Text
Whitespace = Text.Whitespace
Newline = Whitespace.Newline
Error = Token.Error
# Text that doesn't belong to this lexer
Other = Token.Other

# Common token types for source code
Keyword = Token.Keyword
Name = Token.Name

Literal = Token.Literal
String = Literal.String
Number = Literal.Number

Operator = Token.Operator
Comparison = Operator.Comparison
Arithmetic = Operator.Arithmetic
Logical = Operator.Logical

Punctuation = Token.Punctuation

Wildcard = Token.Wildcard
Comment = Token.Comment
Assignment = Token.Assignment

# Generic types for non-source code
Generic = Token.Generic
Command = Generic.Command

# String and some others are not direct children of Token.
# alias them:
Token.Token = Token
Token.String = String
Token.Number = Number

# Specific tokens
CTE = Keyword.CTE
