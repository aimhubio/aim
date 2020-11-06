from typing import Optional

from aim.sdk.utils import get_default_session


def track(*args, **kwargs):
    sess = get_default_session()
    return sess.track(*args, **kwargs)


def set_params(params: dict, name: Optional[str] = None):
    sess = get_default_session()
    return sess.set_params(params, name)
