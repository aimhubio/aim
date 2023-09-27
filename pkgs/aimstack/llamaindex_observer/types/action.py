"""
This module defines the smallest units, called Actions, that capture metadata
for single events during the LlamaIndex execution.
The following types of events are supported:


Actions are meant to be aggregated and stored as a single Step in an Aim Sequence.

Attributes:
"""

from typing import Optional, List, Dict, Any, Union
from dataclasses import dataclass, field

# Define constants for various event types LlamaIndex provides
EMBEDDING = 'embedding'
LLM = 'llm'
QUERY = 'query'
RETRIEVE = 'retrieve'
SYNTHESIZE = 'synthesize'
TEMPLATING = 'templating'


@dataclass(frozen=True)
class LlamaAction:
    """
    The base LlamaAction class from which all specific event LlamaAction classes inherit.
    This is a generic container for holding event metadata.
    """
    pass


@dataclass(frozen=True)
class EmbeddingAction(LlamaAction):
    """
    Captures metadata for the 'Embedding' event.
    """
    model_name: Optional[str] = None
    batch_size: Optional[int] = None
    event: str = field(default=EMBEDDING)
    end_event: bool = field(default=False)


@dataclass(frozen=True)
class LLMAction(LlamaAction):
    """
    Captures metadata for the 'LLM' event.
    """
    messages: Optional[List[str]] = None
    model_name: Optional[str] = None
    temperature: Optional[float] = None
    event: str = field(default=LLM)
    end_event: bool = field(default=False)


@dataclass(frozen=True)
class TemplatingAction(LlamaAction):
    """
    Captures metadata for the 'Templating' event.
    """
    template_text: Optional[str] = None
    template_vars: Optional[Dict[str, Any]] = None
    event: str = field(default=TEMPLATING)
    end_event: bool = field(default=False)


@dataclass(frozen=True)
class RetrieveAction(LlamaAction):
    """
    Captures metadata for the 'Retrieve' event.
    """
    query_text: Optional[str] = None
    event: str = field(default=RETRIEVE)
    end_event: bool = field(default=False)


@dataclass(frozen=True)
class SynthesizeAction(LlamaAction):
    """
    Captures metadata for the 'Synthesize' event.
    """
    query_text: Optional[str] = None
    event: str = field(default=SYNTHESIZE)
    end_event: bool = field(default=False)


@dataclass(frozen=True)
class QueryAction(LlamaAction):
    """
    Captures metadata for the 'Query' event.
    """
    query_text: Optional[str] = None
    event: str = field(default=QUERY)
    end_event: bool = field(default=False)


@dataclass(frozen=True)
class EmbeddingEndAction(LlamaAction):
    """
    Captures metadata for the 'Embedding' event.
    """
    chunks: Optional[List[str]] = None
    event: str = field(default=EMBEDDING)
    end_event: bool = field(default=True)


@dataclass(frozen=True)
class LLMEndAction(LlamaAction):
    """
    Captures metadata for the 'LLM' event.
    """
    messages: Optional[List[str]] = None
    response: Optional[str] = None
    model_name: Optional[str] = None
    token_usage: Optional[Dict[str, float]] = None
    event: str = field(default=LLM)
    end_event: bool = field(default=True)


@dataclass(frozen=True)
class TemplatingEndAction(LlamaAction):
    """
    Captures metadata for the 'Templating' event.
    """
    event: str = field(default=TEMPLATING)
    end_event: bool = field(default=True)


@dataclass(frozen=True)
class RetrieveEndAction(LlamaAction):
    """
    Captures metadata for the 'Retrieve' event.
    """
    nodes: Optional[List[Dict[str, Any]]] = None
    event: str = field(default=RETRIEVE)
    end_event: bool = field(default=True)


@dataclass(frozen=True)
class SynthesizeEndAction(LlamaAction):
    """
    Captures metadata for the 'Synthesize' event.
    """
    response: str
    event: str = field(default=SYNTHESIZE)
    end_event: bool = field(default=True)


@dataclass(frozen=True)
class QueryEndAction(LlamaAction):
    """
    Captures metadata for the 'Query' event.
    """
    response: str
    event: str = field(default=QUERY)
    end_event: bool = field(default=True)

# TODO: Implement dataclasses for capturing metadata of chunking, node_parsing, tree, and sub_question events.
