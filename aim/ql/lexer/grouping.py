from aim.ql.lexer import ql
from aim.ql.lexer import tokens as T
from aim.ql.lexer.utils import recurse, imt


T_NUMERICAL = (T.Number, T.Number.Integer, T.Number.Float)
T_STRING = (T.String, T.String.Single, T.String.Symbol)
T_NAME = (T.Name, T.Name.Placeholder)


def _group_matching(tlist, cls):
    """Groups Tokens that have beginning and end."""
    opens = []
    tidx_offset = 0
    for idx, token in enumerate(list(tlist)):
        tidx = idx - tidx_offset

        if token.is_whitespace:
            continue

        if token.is_group and not isinstance(token, cls):
            # Check inside previously grouped (i.e. parenthesis) if group
            # of different type is inside (i.e., case). though ideally  should
            # should check for all open/close tokens at once to avoid recursion
            _group_matching(token, cls)
            continue

        if token.match(*cls.M_OPEN):
            opens.append(tidx)

        elif token.match(*cls.M_CLOSE):
            try:
                open_idx = opens.pop()
            except IndexError:
                # this indicates invalid ql and unbalanced tokens.
                # instead of break, continue in case other "valid" groups exist
                continue
            close_idx = tidx
            tlist.group_tokens(cls, open_idx, close_idx)
            tidx_offset += close_idx - open_idx


def group_brackets(tlist):
    _group_matching(tlist, ql.SquareBrackets)


def group_parenthesis(tlist):
    _group_matching(tlist, ql.Parenthesis)


def group_case(tlist):
    _group_matching(tlist, ql.Case)


def group_if(tlist):
    _group_matching(tlist, ql.If)


def group_for(tlist):
    _group_matching(tlist, ql.For)


def group_begin(tlist):
    _group_matching(tlist, ql.Begin)


def group_typecasts(tlist):
    def match(token):
        return token.match(T.Punctuation, '::')

    def valid(token):
        return token is not None

    def post(tlist, pidx, tidx, nidx):
        return pidx, nidx

    valid_prev = valid_next = valid
    _group(tlist, ql.Identifier, match, valid_prev, valid_next, post)


def group_tzcasts(tlist):
    def match(token):
        return token.ttype == T.Keyword.TZCast

    def valid(token):
        return token is not None

    def post(tlist, pidx, tidx, nidx):
        return pidx, nidx

    _group(tlist, ql.Identifier, match, valid, valid, post)


def group_typed_literal(tlist):
    def match(token):
        return imt(token, m=ql.TypedLiteral.M_OPEN)

    def match_to_extend(token):
        return isinstance(token, ql.TypedLiteral)

    def valid_prev(token):
        return token is not None

    def valid_next(token):
        return token is not None and token.match(*ql.TypedLiteral.M_CLOSE)

    def valid_final(token):
        return token is not None and token.match(*ql.TypedLiteral.M_EXTEND)

    def post(tlist, pidx, tidx, nidx):
        return tidx, nidx

    _group(tlist, ql.TypedLiteral, match, valid_prev, valid_next,
           post, extend=False)
    _group(tlist, ql.TypedLiteral, match_to_extend, valid_prev, valid_final,
           post, extend=True)


def group_period(tlist):
    def match(token):
        return token.match(T.Punctuation, '.')

    def valid_prev(token):
        qlcls = ql.SquareBrackets, ql.Identifier
        ttypes = T.Name, T.String.Symbol
        return imt(token, i=qlcls, t=ttypes)

    def valid_next(token):
        return True

    def post(tlist, pidx, tidx, nidx):
        qlcls = ql.SquareBrackets, ql.Function
        ttypes = T.Name, T.String.Symbol, T.Wildcard
        next_ = tlist[nidx] if nidx is not None else None
        valid_next = imt(next_, i=qlcls, t=ttypes)

        return (pidx, nidx) if valid_next else (pidx, tidx)

    _group(tlist, ql.Identifier, match, valid_prev, valid_next, post)


def group_as(tlist):
    def match(token):
        return token.is_keyword and token.normalized == 'AS'

    def valid_prev(token):
        return token.normalized == 'NULL' or not token.is_keyword

    def valid_next(token):
        ttypes = T.CTE
        return not imt(token, t=ttypes) and token is not None

    def post(tlist, pidx, tidx, nidx):
        return pidx, nidx

    _group(tlist, ql.Identifier, match, valid_prev, valid_next, post)


def group_assignment(tlist):
    def match(token):
        return token.match(T.Assignment, ':=')

    def valid(token):
        return token is not None and token.ttype not in (T.Keyword)

    def post(tlist, pidx, tidx, nidx):
        m_semicolon = T.Punctuation, ';'
        snidx, _ = tlist.token_next_by(m=m_semicolon, idx=nidx)
        nidx = snidx or nidx
        return pidx, nidx

    valid_prev = valid_next = valid
    _group(tlist, ql.Assignment, match, valid_prev, valid_next, post)


def group_comparison(tlist):
    qlcls = (ql.Parenthesis, ql.Function, ql.Identifier,
              ql.Operation, ql.TypedLiteral)
    ttypes = T_NUMERICAL + T_STRING + T_NAME

    def match(token):
        return token.ttype == T.Operator.Comparison

    def valid(token):
        if imt(token, t=ttypes, i=qlcls):
            return True
        elif token and token.is_keyword and token.normalized == 'NULL':
            return True
        else:
            return False

    def post(tlist, pidx, tidx, nidx):
        return pidx, nidx

    valid_prev = valid_next = valid
    _group(tlist, ql.Comparison, match,
           valid_prev, valid_next, post, extend=False)


@recurse(ql.Identifier)
def group_identifier(tlist):
    ttypes = (T.String.Symbol, T.Name)

    tidx, token = tlist.token_next_by(t=ttypes)
    while token:
        tlist.group_tokens(ql.Identifier, tidx, tidx)
        tidx, token = tlist.token_next_by(t=ttypes, idx=tidx)


def group_arrays(tlist):
    qlcls = ql.SquareBrackets, ql.Identifier, ql.Function
    ttypes = T.Name, T.String.Symbol

    def match(token):
        return isinstance(token, ql.SquareBrackets)

    def valid_prev(token):
        return imt(token, i=qlcls, t=ttypes)

    def valid_next(token):
        return True

    def post(tlist, pidx, tidx, nidx):
        return pidx, tidx

    _group(tlist, ql.Identifier, match,
           valid_prev, valid_next, post, extend=True, recurse=False)


def group_operator(tlist):
    ttypes = T_NUMERICAL + T_STRING + T_NAME
    qlcls = (ql.SquareBrackets, ql.Parenthesis, ql.Function,
             ql.Identifier, ql.Operation, ql.TypedLiteral)

    def match(token):
        return imt(token, t=(T.Operator, T.Wildcard))

    def valid(token):
        return imt(token, i=qlcls, t=ttypes) \
            or (token and token.match(
                T.Keyword,
                ('CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP')))

    def post(tlist, pidx, tidx, nidx):
        tlist[tidx].ttype = T.Operator
        return pidx, nidx

    valid_prev = valid_next = valid
    _group(tlist, ql.Operation, match,
           valid_prev, valid_next, post, extend=False)


def group_identifier_list(tlist):
    m_role = T.Keyword, ('null', 'role')
    qlcls = (ql.Function, ql.Case, ql.Identifier, ql.Comparison,
              ql.IdentifierList, ql.Operation)
    ttypes = (T_NUMERICAL + T_STRING + T_NAME
              + (T.Keyword, T.Comment, T.Wildcard))

    def match(token):
        return token.match(T.Punctuation, ',')

    def valid(token):
        return imt(token, i=qlcls, m=m_role, t=ttypes)

    def post(tlist, pidx, tidx, nidx):
        return pidx, nidx

    valid_prev = valid_next = valid
    _group(tlist, ql.IdentifierList, match,
           valid_prev, valid_next, post, extend=True)


@recurse(ql.Comment)
def group_comments(tlist):
    tidx, token = tlist.token_next_by(t=T.Comment)
    while token:
        eidx, end = tlist.token_not_matching(
            lambda tk: imt(tk, t=T.Comment) or tk.is_whitespace, idx=tidx)
        if end is not None:
            eidx, end = tlist.token_prev(eidx, skip_ws=False)
            tlist.group_tokens(ql.Comment, tidx, eidx)

        tidx, token = tlist.token_next_by(t=T.Comment, idx=tidx)


@recurse(ql.Where)
def group_where(tlist):
    tidx, token = tlist.token_next_by(m=ql.Where.M_OPEN)
    while token:
        eidx, end = tlist.token_next_by(m=ql.Where.M_CLOSE, idx=tidx)

        if end is None:
            end = tlist._groupable_tokens[-1]
        else:
            end = tlist.tokens[eidx - 1]
        eidx = tlist.token_index(end)
        tlist.group_tokens(ql.Where, tidx, eidx)
        tidx, token = tlist.token_next_by(m=ql.Where.M_OPEN, idx=tidx)


@recurse()
def group_aliased(tlist):
    I_ALIAS = (ql.Parenthesis, ql.Function, ql.Case, ql.Identifier,
               ql.Operation, ql.Comparison)

    tidx, token = tlist.token_next_by(i=I_ALIAS, t=T.Number)
    while token:
        nidx, next_ = tlist.token_next(tidx)
        if isinstance(next_, ql.Identifier):
            tlist.group_tokens(ql.Identifier, tidx, nidx, extend=True)
        tidx, token = tlist.token_next_by(i=I_ALIAS, t=T.Number, idx=tidx)


def group_order(tlist):
    """Group together Identifier and Asc/Desc token"""
    tidx, token = tlist.token_next_by(t=T.Keyword.Order)
    while token:
        pidx, prev_ = tlist.token_prev(tidx)
        if imt(prev_, i=ql.Identifier, t=T.Number):
            tlist.group_tokens(ql.Identifier, pidx, tidx)
            tidx = pidx
        tidx, token = tlist.token_next_by(t=T.Keyword.Order, idx=tidx)


@recurse()
def align_comments(tlist):
    tidx, token = tlist.token_next_by(i=ql.Comment)
    while token:
        pidx, prev_ = tlist.token_prev(tidx)
        if isinstance(prev_, ql.TokenList):
            tlist.group_tokens(ql.TokenList, pidx, tidx, extend=True)
            tidx = pidx
        tidx, token = tlist.token_next_by(i=ql.Comment, idx=tidx)


def group_values(tlist):
    tidx, token = tlist.token_next_by(m=(T.Keyword, 'VALUES'))
    start_idx = tidx
    end_idx = -1
    while token:
        if isinstance(token, ql.Parenthesis):
            end_idx = tidx
        tidx, token = tlist.token_next(tidx)
    if end_idx != -1:
        tlist.group_tokens(ql.Values, start_idx, end_idx, extend=True)


def group(stmt):
    for func in [
        group_comments,

        # _group_matching
        group_brackets,
        group_parenthesis,
        group_case,
        group_if,
        group_for,
        group_begin,

        group_where,
        group_period,
        group_arrays,
        group_identifier,
        group_order,
        group_typecasts,
        group_tzcasts,
        group_typed_literal,
        group_operator,
        group_comparison,
        group_as,
        group_aliased,
        group_assignment,

        align_comments,
        group_identifier_list,
        group_values,
    ]:
        func(stmt)
    return stmt


def _group(tlist, cls, match,
           valid_prev=lambda t: True,
           valid_next=lambda t: True,
           post=None,
           extend=True,
           recurse=True
           ):
    """Groups together tokens that are joined by a middle token. i.e. x < y"""

    tidx_offset = 0
    pidx, prev_ = None, None
    for idx, token in enumerate(list(tlist)):
        tidx = idx - tidx_offset

        if token.is_whitespace:
            continue

        if recurse and token.is_group and not isinstance(token, cls):
            _group(token, cls, match, valid_prev, valid_next, post, extend)

        if match(token):
            nidx, next_ = tlist.token_next(tidx)
            if prev_ and valid_prev(prev_) and valid_next(next_):
                from_idx, to_idx = post(tlist, pidx, tidx, nidx)
                grp = tlist.group_tokens(cls, from_idx, to_idx, extend=extend)

                tidx_offset += to_idx - from_idx
                pidx, prev_ = from_idx, grp
                continue

        pidx, prev_ = tidx, token