# Path to the Aim boards directory relative to the package root.
__aim_boards__ = 'boards'

# List of Aim Container and Sequence classes available in the package.
from .types import Trace, StepSequence
__aim_types__ = [Trace, StepSequence]

__description__ = 'A simple LlamaIndex debugger and observer, which logs metadata such as embeddings chunks, retrieval nodes, queries and responses.'
__author__ = 'AimStack'
__category__ = 'AI Systems Debugging'
