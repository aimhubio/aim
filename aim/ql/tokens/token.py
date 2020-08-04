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

    def get_cleaned_value(self, fields: dict = None, *add_fields):
        if self.type == List:
            return [token.get_cleaned_value(fields, *add_fields)
                    for token in self.value]

        if self.type not in (Identifier, Path):
            return self.value

        if self.type == Identifier:
            path = self.value
        else:
            path = '.'.join([token.value for token in self.value])

        all_fields = [fields] + list(*add_fields)
        search_field_match = None
        for fields in all_fields:
            search_field_match = jmespath.search(path, fields)
            if search_field_match is not None:
                break

        if self.type == Identifier:
            # Treat as string
            # FIXME: return `None` instead of self.value,
            #  if `NoneType` value is assigned to the given path
            return search_field_match or self.value
        else:
            # Treat as None
            return search_field_match


class TokenList(Token):
    def __init__(self, ttype: str, tokens: list = []):
        super(TokenList, self).__init__(tokens, ttype)

    def append(self, item: Token):
        self._value.append(item)
