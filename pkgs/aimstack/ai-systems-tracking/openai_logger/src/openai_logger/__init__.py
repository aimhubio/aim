__aim_boards__ = "boards"

from openai_logger.logging.analytics import *
from openai_logger.logging.chat import *
from openai_logger.logging.openai.chat_completion import *


__all__ = [
    "Session",
    "SessionProd",
    "SessionDev",
    "Experiment",
    "Release",
    "MessagesSequence",
    "UserActivity",
    "UserActions",
    "ChatCompletion",
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
    setattr(aim_type, "__aim_package__", "openai_logger")
