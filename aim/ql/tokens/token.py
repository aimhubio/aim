from aim.ql.tokens.types import *


class Token(object):
    types = [
        String, Integer, Float, Boolean, None_,
        List,
        Comparison, Logical,
        Identifier, Path,
        Expression,
    ]

    def __init__(self, value, ltype):
        if ltype == 'Number':
            if '.' in value:
                cleaned_value, ttype = float(value), Float
            else:
                cleaned_value, ttype = int(value), Integer
        elif ltype == 'String':
            cleaned_value = str(value).strip().strip('"')
            ttype = String
        elif ltype == 'Boolean':
            cleaned_value = True if str(value) == 'True' else False
            ttype = Boolean
        elif ltype == 'None':
            cleaned_value, ttype = None, None_
        elif ltype == 'Identifier':
            ttype = Identifier
            cleaned_value = str(value)
        elif ltype == 'List':
            cleaned_value, ttype = [], List
        elif ltype == 'Path':
            cleaned_value, ttype = [], Path
        elif ltype == 'Expression':
            cleaned_value, ttype = [], Expression
        elif ltype == 'Operator':
            cleaned_value = value.strip()
            if cleaned_value == 'and' \
                    or cleaned_value == 'or' \
                    or cleaned_value == 'not':
                ttype = Logical
            else:
                ttype = Comparison
        else:
            raise TypeError('undefined `Token` type')

        self._value = cleaned_value
        self._ttype = ttype

    def __repr__(self):
        return '{}: {}'.format(self.type, self.value)

    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, value):
        # TODO
        self._value = value

    @property
    def type(self):
        return self._ttype

    @type.setter
    def type(self, ttype):
        # TODO
        self._ttype = ttype

    def is_group(self) -> bool:
        return False


class TokenList(Token):
    def __init__(self, ttype):
        super(TokenList, self).__init__([], ttype)

    def append(self, item):
        self._value.append(item)

    def is_group(self) -> bool:
        return True
