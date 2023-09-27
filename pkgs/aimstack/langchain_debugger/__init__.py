# Path to the Aim boards directory relative to the package root.
__aim_boards__ = 'boards'

# List of Aim Container and Sequence classes available in the package.
from .types import StepSequence, Trace
__aim_types__ = [Trace, StepSequence]
