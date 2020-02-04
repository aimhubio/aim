import aim.profiler.interfaces as interfaces


class Profiler:
    # @classmethod
    # def configure(cls, sec_interval, squash=Profiler.SQUASH_AMOUNT):
    #     p = Profiler()
    #     p.sec_interval = sec_interval
    #     p.squash = squash

    @classmethod
    def label(cls, key, inp=None):
        return interfaces.TensorFlowInterface.label(key, inp)

    @classmethod
    def loop(cls, key, inp=None):
        return interfaces.TensorFlowInterface.loop(key, inp)
