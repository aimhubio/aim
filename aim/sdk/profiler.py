from aim.profiler.profiler import Profiler as ProfilerBase
import aim.profiler.interfaces as interfaces
from aim.profiler.stat import Stat


class Profiler:
    MEAN = Stat.AGG_MODE_AVG
    MIN = Stat.AGG_MODE_MIN
    MAX = Stat.AGG_MODE_MAX

    keras = interfaces.KerasInterface
    tf = interfaces.TensorFlowInterface

    @classmethod
    def init(cls, auto_detect_cycles=True,
             aggregate=False, **kwargs):
        """
        Enables Profiler(e.g. for training or evaluation).
        Profiler will not act until this method is called.
        `start` method sets environment variable and starts
        collecting statistics.
        """
        p = ProfilerBase()
        p.start(auto_detect_cycles, aggregate)

        # Set minimum cycles aggregation interval in seconds
        if kwargs.get('sec_interval'):
            p.sec_interval = kwargs.get('sec_interval')

        # Set minimum number of cycles required for squash
        if kwargs.get('squash'):
            p.squash = kwargs.get('squash')

    @classmethod
    def label(cls, key):
        return interfaces.DefaultInterface.label(key)

    @classmethod
    def loop(cls, key):
        return interfaces.DefaultInterface.loop(key)

    @classmethod
    def cycle(cls):
        return interfaces.DefaultInterface.cycle()
