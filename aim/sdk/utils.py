from aim.sdk.session import Session


def get_default_session() -> Session:
    if len(Session.sessions) > 1:
        raise ValueError('multiple sessions are initialized')
    elif len(Session.sessions) == 1:
        return Session.sessions[0]
    elif len(Session.sessions) == 0:
        return Session()
