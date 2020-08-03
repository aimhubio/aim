import re
import jmespath
from typing import Any

from aim.ql.tokens.types import *


class Token(object):
    types = [
        String, Integer, Float, Boolean, None_,
        List,
        Comparison, Logical,
        Identifier, Path,
        Expression,
    ]

    def __init__(self, value: Any, ltype: str):
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
            cleaned_value = re.sub(' +', ' ', value.strip())
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
    def value(self) -> Any:
        return self._value

    @value.setter
    def value(self, value: Any):
        # TODO
        self._value = value

    @property
    def type(self) -> TokenType:
        return self._ttype

    @type.setter
    def type(self, ttype: TokenType):
        # TODO
        self._ttype = ttype

    def get_cleaned_value(self, fields: dict = None):
        if self.type == Identifier:
            # FIXME: return `None`, not self.value
            #  if `NoneType` value is assigned to the corresponding path
            search_field = jmespath.search(self.value, fields)
            return search_field or self.value
        elif self.type == Path:
            path = '.'.join([token.value for token in self.value])
            return jmespath.search(path, fields)
        elif self.type == List:
            return [token.get_cleaned_value(fields) for token in self.value]
        return self.value


class TokenList(Token):
    def __init__(self, ttype: str, tokens: list = []):
        super(TokenList, self).__init__(tokens, ttype)

    def append(self, item: Token):
        self._value.append(item)
