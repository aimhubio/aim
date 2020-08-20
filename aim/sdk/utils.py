from aim.sdk.session import Session, DefaultSession


def get_default_session() -> Session:
    if len(Session.sessions.keys()) > 1:
        raise ValueError('multiple sessions are initialized')
    elif len(Session.sessions.keys()) == 1:
        return list(Session.sessions.values())[0]
    elif len(Session.sessions.keys()) == 0:
        return DefaultSession()
