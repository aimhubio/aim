from aim.profiler.profiler import Profiler as ProfilerBase
import aim.profiler.interfaces as interfaces


class Profiler:
    keras = interfaces.KerasInterface
    tf = interfaces.TensorFlowInterface

    @classmethod
    def init(cls):
        """
        Enables Profiler, e.g. for training or evaluation.
        Profiler will not act until this method is called.
        `start` method sets environment variable and starts
        collecting statistics.
        """
        p = ProfilerBase()
        p.start()

    @classmethod
    def configure(cls, sec_interval, squash=None):
        p = ProfilerBase()
        p.sec_interval = sec_interval
        p.squash = squash

    @classmethod
    def label(cls, key):
        return interfaces.DefaultInterface.label(key)

    @classmethod
    def loop(cls, key):
        return interfaces.DefaultInterface.loop(key)
