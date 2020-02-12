from aim.profiler.profiler import Profiler as ProfilerBase
import aim.profiler.interfaces as interfaces


class Profiler:
    keras = interfaces.KerasInterface
    tf = interfaces.TensorFlowInterface

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
