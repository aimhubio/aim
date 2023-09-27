"""
This module defines two primary classes: Step and StepSequence.

The Step Record stores aggreated actions of a single execution step in LangChain.
Specifically, it stores a list of Actions, which are individual events that occur during the execution.
These includes:
- Language model (LLM) prompts and generations,
- Tool inputs and outputs,
- Agent actions,
- Chains start and end.

The StepSequence class is a construct that holds a sequence of Step Records.
It can be used to represent:
- A conversation with an assistant
- A series of queries
- etc.

Classes:
    Step: Represents a single execution step and holds a list of Actions.
    StepSequence: A sequence that tracks multiple Step Records.
"""

from typing import List
from dataclasses import asdict

from aim import Sequence, Record

from aimstack.langchain_debugger.types.action import Action


class Step(Record):
    """
    Represents a single execution step in LangChain, which includes a list of Actions.
    Actions are operations performed by agents, chains, or language models (LLMs).
    """

    AIM_NAME = 'langchain_debugger.Step'

    def __init__(self, actions: List[Action]):
        """
        Initialize a Step Record.

        Args:
            actions (List[Action]): A list of Action objects representing
            individual events during the execution.
        """
        # Convert Action objects to dictionaries
        serialized_actions = [asdict(action) for action in actions]
        # Store actions to Aim storage
        self.storage['actions'] =  serialized_actions


class StepSequence(Sequence[Step]):
    """
    Construct that holds a sequence of Step Records.
    Useful for representing a series of executions,
    a conversation with an assistant, or a sequence of queries.
    """
    pass
