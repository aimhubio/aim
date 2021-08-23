from aim.sdk.legacy.session import DefaultSession
from aim.sdk.legacy.deprecation_warning import deprecated


@deprecated
def init(*args, **kwargs):
    DefaultSession(*args, **kwargs)
