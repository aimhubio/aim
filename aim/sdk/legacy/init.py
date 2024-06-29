from aim.sdk.legacy.deprecation_warning import deprecated
from aim.sdk.legacy.session import DefaultSession


@deprecated
def init(*args, **kwargs):
    DefaultSession(*args, **kwargs)
