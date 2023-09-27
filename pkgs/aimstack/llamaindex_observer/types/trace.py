"""
This module defines the Trace type (Aim Container), which is used for logging LlamaIndex executions.
Trace is a specialized Container that stores LlamaIndex-specific execution logs:
- Execution metadata,
- Sequences of actions performed by engine,
- Token usage metrics,
- System resource utilization,
- etc

Traces can be queried using the Aim Query Language.

Classes:
    Trace: Represents a LlamaIndex execution, stores its metadata and sequences of actions.
"""

from aim import Container


class Trace(Container):
    """
    Represents a LlamaIndex execution.
    """
    pass  # No additional functionality needed at the moment
