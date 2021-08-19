from typing import Optional

from aim.sdk.legacy.session.session import get_default_session
from aim.sdk.legacy.deprecation_warning import deprecated


@deprecated
def track(*args, **kwargs):
    sess = get_default_session()
    return sess.track(*args, **kwargs)


@deprecated
def set_params(params: dict, name: Optional[str] = None):
    sess = get_default_session()
    return sess.set_params(params, name)
