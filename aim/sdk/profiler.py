from aim.profiler.profiler import Profiler as ProfilerBase
import aim.profiler.interfaces as interfaces


class Profiler:
    keras = interfaces.KerasInterface
    tf = interfaces.TensorFlowInterface

    @classmethod
    def init(cls, auto_detect_cycles=True, **kwargs):
        """
        Enables Profiler(e.g. for training or evaluation).
        Profiler will not act until this method is called.
        `start` method sets environment variable and starts
        collecting statistics.
        """
        p = ProfilerBase()
        p.start(auto_detect_cycles)

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
