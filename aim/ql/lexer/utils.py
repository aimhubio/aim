import itertools
from collections import deque


def consume(iterator, n):
    """Advance the iterator n-steps ahead. If n is none, consume entirely."""
    deque(itertools.islice(iterator, n), maxlen=0)


def remove_quotes(val):
    """Helper that removes surrounding quotes from strings."""
    if val is None:
        return
    if val[0] in ('"', "'") and val[0] == val[-1]:
        val = val[1:-1]
    return val


def imt(token, i=None, m=None, t=None):
    """Helper function to simplify comparisons Instance, Match and TokenType
    """
    clss = i
    types = [t, ] if t and not isinstance(t, list) else t
    mpatterns = [m, ] if m and not isinstance(m, list) else m

    if token is None:
        return False
    elif clss and isinstance(token, clss):
        return True
    elif mpatterns and any(token.match(*pattern) for pattern in mpatterns):
        return True
    elif types and any(token.ttype in ttype for ttype in types):
        return True
    else:
        return False


def recurse(*cls):
    """Function decorator to help with recursion
    """

    def wrap(f):
        def wrapped_f(tlist):
            for sgroup in tlist.get_sublists():
                if not isinstance(sgroup, cls):
                    wrapped_f(sgroup)
            f(tlist)

        return wrapped_f

    return wrap
