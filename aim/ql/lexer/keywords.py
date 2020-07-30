import re

from aim.ql.lexer import tokens


def is_keyword(value):
    val = value.upper()
    return (KEYWORDS.get(val, tokens.Name)), value


QL_REGEX = {
    'root': [
        (r'(--|# )\+.*?(\r\n|\r|\n|$)', tokens.Comment.Single.Hint),
        (r'/\*\+[\s\S]*?\*/', tokens.Comment.Multiline.Hint),
        (r'(--|# ).*?(\r\n|\r|\n|$)', tokens.Comment.Single),
        (r'/\*[\s\S]*?\*/', tokens.Comment.Multiline),
        (r'(\r\n|\r|\n)', tokens.Newline),
        (r'\s+?', tokens.Whitespace),
        (r':=', tokens.Assignment),
        (r'::', tokens.Punctuation),
        (r'\*', tokens.Wildcard),
        (r"`(``|[^`])*`", tokens.Name),
        (r"´(´´|[^´])*´", tokens.Name),
        (r'((?<!\S)\$(?:[_A-ZÀ-Ü]\w*)?\$)[\s\S]*?\1', tokens.Literal),
        (r'\?', tokens.Name.Placeholder),
        (r'%(\(\w+\))?s', tokens.Name.Placeholder),
        (r'(?<!\w)[$:?]\w+', tokens.Name.Placeholder),
        (r'\\\w+', tokens.Command),
        (r'(CASE|IN|VALUES|USING|FROM|AS)\b', tokens.Keyword),
        (r'(@|##|#)[A-ZÀ-Ü]\w+', tokens.Name),
        (r'[A-ZÀ-Ü]\w*(?=\s*\.)', tokens.Name),  # 'Name'   .
        (r'(?<=\.)[A-ZÀ-Ü]\w*', tokens.Name),  # .'Name'
        (r'[A-ZÀ-Ü]\w*(?=\()', tokens.Name),  # side effect: change kw to func
        (r'-?0x[\dA-F]+', tokens.Number.Hexadecimal),
        (r'-?\d*(\.\d+)?E-?\d+', tokens.Number.Float),
        (r'(?![_A-ZÀ-Ü])-?(\d+(\.\d*)|\.\d+)(?![_A-ZÀ-Ü])',
         tokens.Number.Float),
        (r'(?![_A-ZÀ-Ü])-?\d+(?![_A-ZÀ-Ü])', tokens.Number.Integer),
        (r"'(''|\\\\|\\'|[^'])*'", tokens.String.Single),
        (r'"(""|\\\\|\\"|[^"])*"', tokens.String.Symbol),
        (r'(""|".*?[^\\]")', tokens.String.Symbol),
        (r'(?<![\w\])])(\[[^\]]+\])', tokens.Name),
        (r'((LEFT\s+|RIGHT\s+|FULL\s+)?(INNER\s+|OUTER\s+|STRAIGHT\s+)?'
         r'|(CROSS\s+|NATURAL\s+)?)?JOIN\b', tokens.Keyword),
        (r'END(\s+IF|\s+LOOP|\s+WHILE)?\b', tokens.Keyword),
        (r'NOT\s+NULL\b', tokens.Keyword),
        (r'NULLS\s+(FIRST|LAST)\b', tokens.Keyword),
        (r'UNION\s+ALL\b', tokens.Keyword),
        (r'DOUBLE\s+PRECISION\b', tokens.Name.Builtin),
        (r'GROUP\s+BY\b', tokens.Keyword),
        (r'ORDER\s+BY\b', tokens.Keyword),
        (r'(LATERAL\s+VIEW\s+)'
         r'(EXPLODE|INLINE|PARSE_URL_TUPLE|POSEXPLODE|STACK)\b',
         tokens.Keyword),
        (r"(AT|WITH')\s+TIME\s+ZONE\s+'[^']+'", tokens.Keyword.TZCast),
        (r'(NOT\s+)?(LIKE|ILIKE)\b', tokens.Operator.Comparison),
        (r'[0-9_A-ZÀ-Ü][_$#\w]*', is_keyword),
        (r'[;:()\[\],\.]', tokens.Punctuation),
        (r'[<>=~!]+', tokens.Operator.Comparison),
        (r'[+/@#%^&|`?^-]+', tokens.Arithmetic),
    ]
}

FLAGS = re.IGNORECASE | re.UNICODE
QL_REGEX = [(re.compile(rx, FLAGS).match, tt) for rx, tt in QL_REGEX['root']]

KEYWORDS = {
    'SELECT': tokens.Keyword.DML,

    'WHERE': tokens.Keyword,
    'FROM': tokens.Keyword,
    'INNER': tokens.Keyword,
    'JOIN': tokens.Keyword,
    'STRAIGHT_JOIN': tokens.Keyword,
    'LIKE': tokens.Keyword,
    'ON': tokens.Keyword,
    'IN': tokens.Keyword,
    'SET': tokens.Keyword,
    'AND': tokens.Logical,
    'OR': tokens.Logical,
    'NOT': tokens.Logical,

    'BY': tokens.Keyword,
    'GROUP': tokens.Keyword,
    'ORDER': tokens.Keyword,
    'LEFT': tokens.Keyword,
    'OUTER': tokens.Keyword,
    'FULL': tokens.Keyword,

    'IF': tokens.Keyword,
    'END': tokens.Keyword,
    'THEN': tokens.Keyword,
    'LOOP': tokens.Keyword,
    'AS': tokens.Keyword,
    'ELSE': tokens.Keyword,
    'FOR': tokens.Keyword,
    'WHILE': tokens.Keyword,

    'CASE': tokens.Keyword,
    'WHEN': tokens.Keyword,
    'MIN': tokens.Keyword,
    'MAX': tokens.Keyword,
    'DISTINCT': tokens.Keyword,
}
