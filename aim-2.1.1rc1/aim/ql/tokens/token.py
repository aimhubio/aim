import re
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

    def __str__(self):
        if self.type == List:
            return '[{}]'.format(','.join([str(token) for token in self.value]))
        elif self.type == Path:
            return '.'.join([str(token) for token in self.value])
        else:
            return str(self.value)

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

        all_fields = [fields] + list(add_fields)
        search_field_match = None
        found = False
        for fields in all_fields:
            if self.type == Identifier and self.value in fields.keys():
                search_field_match = fields[self.value]
                found = True
                break

            if self.type == Path:
                fields_search = fields
                path_found = True
                for token in self.value:
                    if isinstance(fields_search, dict) \
                            and token.value in fields_search.keys():
                        fields_search = fields_search[token.value]
                        search_field_match = fields_search
                    else:
                        path_found = False
                        break
                if not path_found:
                    search_field_match = None
                else:
                    found = True
                    break

        if self.type == Identifier:
            if found:
                return search_field_match
            # Treat as string
            return self.value
        else:
            # Treat as None
            return search_field_match


class TokenList(Token):
    def __init__(self, ttype: str, tokens: list = []):
        super(TokenList, self).__init__(tokens, ttype)

    def append(self, item: Token):
        self._value.append(item)
