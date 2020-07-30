from aim.ql.lexer.keywords import QL_REGEX
from aim.ql.lexer import tokens
from aim.ql.lexer.utils import consume


class Lexer(object):
    @staticmethod
    def get_tokens(text, encoding=None):
        if isinstance(text, str):
            pass
        elif isinstance(text, bytes):
            if encoding:
                text = text.decode(encoding)
            else:
                try:
                    text = text.decode('utf-8')
                except UnicodeDecodeError:
                    text = text.decode('unicode-escape')
        else:
            raise TypeError('Expected text or file-like object')

        iterable = enumerate(text)
        for pos, char in iterable:
            for rexmatch, action in QL_REGEX:
                m = rexmatch(text, pos)

                if not m:
                    continue
                elif isinstance(action, tokens._TokenType):
                    yield action, m.group()
                elif callable(action):
                    yield action(m.group())

                consume(iterable, m.end() - pos - 1)
                break
            else:
                yield tokens.Error, char


def tokenize(query, encoding=None):
    return Lexer().get_tokens(query, encoding)
