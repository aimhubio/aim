import aim
import random
import math
import time

foo = 1
bar = 1
seed = 1003

epochs = 4
steps = 30
k = 2.3

sess = aim.Session(experiment='test_system', system_tracking_interval=2)

sess.set_params({
    'epochs': epochs,
    'steps': steps,
    'k': k,
    'foo': foo,
    'bar': bar,
    'seed': seed,
}, name='hparmas')
#
# for e in range(epochs):
#     for i in range(steps):
#         sess.track(k, name='agg_metric', epoch=e, subset='train')
#     sess.track(k, name='agg_metric', epoch=e, subset='val')

time.sleep(10)
