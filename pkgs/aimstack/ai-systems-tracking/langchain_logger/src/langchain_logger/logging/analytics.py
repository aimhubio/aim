from aim import Container, Record, Sequence

"""
    Defines user action to be logged when using the chatbot.
    This can easily reflect any notion of a user in a specific way.

    This is a really simple setup to showcase Aim.

"""


@Record.alias("aim_qa_logger.UserAction")
class UserAction(Record):
    AIM_NAME = "aim_qa_logger.UserAction"

    def __init__(self, action_type: str):
        super().__init__()

        self.storage["action_type"] = action_type

    @property
    def action_type(self):
        return self.storage["action_type"]


class UserActions(Sequence[UserAction]):
    pass


class UserActivity(Container):
    pass
