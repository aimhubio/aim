from aim.sdk.session import Session, DefaultSession


def get_default_session() -> Session:
    if len(Session.sessions.keys()) > 0:
        default_sess_key = list(Session.sessions.keys())[0]
        if len(Session.sessions[default_sess_key]) > 0:
            return Session.sessions[default_sess_key][0]

    # Create and return default session otherwise
    return DefaultSession()
