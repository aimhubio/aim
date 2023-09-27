"""
This module defines the smallest units, called Actions, that capture metadata
for single events during the Langchain execution.
The following types of events are supported:
- Start and end of language models (LLM)
- Start and end of chains
- Start and end of tools
- Agent actions and end events

Actions are meant to be aggregated and stored as a single Step in an Aim Sequence.

Attributes:
    ON_LLM_START (str): Event type for the start of a language model.
    ON_LLM_END (str): Event type for the end of a language model.
    ON_CHAIN_START (str): Event type for the start of a chain.
    ON_CHAIN_END (str): Event type for the end of a chain.
    ON_TOOL_START (str): Event type for the start of a tool.
    ON_TOOL_END (str): Event type for the end of a tool.
    ON_AGENT_ACTION (str): Event type for an agent action.
    ON_AGENT_END (str): Event type for the end of an agent action.
"""

from typing import List, Dict, Any
from dataclasses import dataclass, field


# Define constants for various event types LangChain provides
ON_LLM_START = 'on_llm_start'
ON_LLM_END = 'on_llm_end'
ON_CHAIN_START = 'on_chain_start'
ON_CHAIN_END = 'on_chain_end'
ON_TOOL_START = 'on_tool_start'
ON_TOOL_END = 'on_tool_end'
ON_AGENT_ACTION = 'on_agent_action'
ON_AGENT_END = 'on_agent_end'

"""
Define dataclasses to hold event metadata.
"""


@dataclass(frozen=True)
class Action:
    """
    The base Action class from which all specific event Action classes inherit.
    This is a generic container for holding event metadata.
    """
    pass


@dataclass(frozen=True)
class LLMStartAction(Action):
    """
    Captures metadata for the 'Start of a Language Model' event.

    Attributes:
        model_name (str): Name of the language model.
        temperature (float): Temperature setting for the language model.
        prompts (List[str]): List of passed prompts.
        event (str): Type of event; defaults to ON_LLM_START.
    """
    model_name: str
    temperature: float
    prompts: List[str]
    event: str = field(default=ON_LLM_START)


@dataclass(frozen=True)
class LLMEndAction(Action):
    """
    Captures metadata for the 'End of a Language Model' event.

    Attributes:
        model_name (str): Name of the language model.
        token_usage (Dict[str, float]): Dictionary of token usage statistics.
        generations (List[Any]): List of generated outputs.
        event (str): Type of event; defaults to ON_LLM_END.
    """
    model_name: str
    token_usage: Dict[str, float]
    generations: List[Any]
    event: str = field(default=ON_LLM_END)


@dataclass(frozen=True)
class ToolStartAction(Action):
    """
    Captures metadata for the 'Start of a Tool' event.

    Attributes:
        name (str): Name of the tool.
        description (str): Description of what the tool does.
        input (str): Input data for the tool.
        event (str): Type of event; defaults to ON_TOOL_START.
    """
    name: str
    description: str
    input: str
    event: str = field(default=ON_TOOL_START)


@dataclass(frozen=True)
class ToolEndAction(Action):
    """
    Captures metadata for the 'End of a Tool' event.

    Attributes:
        name (str): Name of the tool.
        output (str): Output data from the tool.
        event (str): Type of event; defaults to ON_TOOL_END.
    """
    name: str
    output: str
    event: str = field(default=ON_TOOL_END)


@dataclass(frozen=True)
class ChainStartAction(Action):
    """
    Data class representing the start of a chain event in LangChain.

    Attributes:
        id (str): The unique identifier for the chain that's starting.
        input (str): The input data provided to the chain at the start.
        event (str): The type of event. Defaults to ON_CHAIN_START.
    """
    id: str
    input: str
    event: str = field(default=ON_CHAIN_START)


@dataclass(frozen=True)
class ChainEndAction(Action):
    """
    Data class representing the end of a chain event in LangChain.

    Attributes:
        id (str): The unique identifier for the chain that's ending.
        text (str): Additional text associated with the chain's end.
        output (str): The output data produced by the chain at its end.
        event (str): The type of event. Defaults to ON_CHAIN_END.
    """
    id: str
    text: str
    output: str
    event: str = field(default=ON_CHAIN_END)


# TODO: Implement dataclasses for capturing metadata of agent actions and end events.
