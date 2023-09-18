from aim import Container, Record, Sequence
from aimstack.asp import Run

"""
    Create a message type that models the chatbot behavior.
    To be logged as part of the chatbot usage sessions
"""


@Record.alias('langchain_logger.Message')
class Message(Record):
    AIM_NAME = 'langchain_logger.Message'

    def __init__(self, prompt: str, response: str, steps: list):
        super().__init__()

        self.storage['prompt'] = prompt
        self.storage['response'] = response
        self.storage['steps'] = steps

    @property
    def prompt(self):
        return self.storage['prompt']

    @property
    def response(self):
        return self.storage['response']

    @property
    def steps(self):
        return self.storage['steps']

    def __repr__(self):
        return f'Q: "{self.prompt}" \n A: "{self.response}"'


class MessagesSequence(Sequence[Message]):
    pass


"""
    A generic chatbot session.
    This class can be used to query both dev and prod sessions.
"""


class Session(Run):
    pass


"""
    A Production Chatbot session
"""


class SessionProd(Session):
    pass


"""
    A Dev chatbot session
"""


class SessionDev(Session):
    pass


"""
    The LLM experiment.
    This could be LangChain experiment or other experiment.
"""


class Experiment(Container):
    pass


"""
    Each production run should have a release attached to it.
    This object can be extended to store lots of useful information
    - production environment and setup metadata
    - health numbers
    - high-level data on the number of commits it has taken to build the release
    - etc.

"""


class Release(Container):
    pass
