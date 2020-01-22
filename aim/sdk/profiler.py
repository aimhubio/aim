from aim.profiler.profiler import Profiler


def configure_profiler(sec_interval, squash=Profiler.SQUASH_AMOUNT):
    p = Profiler()
    p.sec_interval = sec_interval
    p.squash = squash


def profiler(key):
    p = Profiler()
    p.track(key)


def cycle(key):
    p = Profiler()
    p.cycle(key)
