# Path to the Aim boards directory relative to the package root.
__aim_boards__ = 'boards'

# List of Aim Container and Sequence classes available in the package.
from .types import StepSequence, Trace
__aim_types__ = [Trace, StepSequence]

__description__ = 'Simple LangChain debugger that logs LLM prompts/generations, tool inputs/outputs, and chain metadata.'
__author__ = 'AimStack'
__category__ = 'AI Systems Debugging'
