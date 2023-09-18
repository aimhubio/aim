__aim_boards__ = 'boards'

from llamaindex_logger.logging.analytics import *
from llamaindex_logger.logging.chat import *

__all__ = [
    'Session',
    'SessionProd',
    'SessionDev',
    'Experiment',
    'Release',
    'MessagesSequence',
    'ChunkSequence',
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
    ChunkSequence,
    UserActivity,
    UserActions,
]

for aim_type in __aim_types__:
    setattr(aim_type, '__aim_package__', 'llamaindex_logger')
