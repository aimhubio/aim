__aim_boards__ = 'boards'

from langchain_logger.logging.analytics import *
from langchain_logger.logging.chat import *

__all__ = [
    'Session',
    'SessionProd',
    'SessionDev',
    'Experiment',
    'Release',
    'MessagesSequence',
    'UserActivity',
    'UserActions',
]

__aim_types__ = [
    Session,
    SessionProd,
    SessionDev,
    Experiment,
    Release,
    MessagesSequence,
    UserActivity,
    UserActions,
]

for aim_type in __aim_types__:
    setattr(aim_type, '__aim_package__', 'langchain_logger')
