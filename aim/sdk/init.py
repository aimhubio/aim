from aim.sdk.session import Session


def init(overwrite=False, autocommit=True):
    Session.init(overwrite, autocommit)
