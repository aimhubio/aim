"""
This module defines the Trace type (Aim Container), which is used for logging LangChain executions.
Trace is a specialized Container that stores LangChain-specific execution logs:
- Execution metadata,
- Sequences of actions performed by LLMs, tools, agents and chains,
- Token usage metrics,
- System resource utilization,
- etc

Traces can be queried using the Aim Query Language.

Classes:
    Trace: Represents a LangChain execution, stores its metadata and sequences of actions.
"""

from aim import Container


class Trace(Container):
    """
    Represents a LangChain execution.
    """
    pass  # No additional functionality needed at the moment
