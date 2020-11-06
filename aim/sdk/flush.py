from aim.sdk.utils import get_default_session


def flush():
    sess = get_default_session()
    return sess.flush()
