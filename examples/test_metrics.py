import random
import time
import os

import aim


sess = aim.Session(experiment='TEST_METRICS', flush_frequency=10)
sess2 = aim.Session(experiment='TEST_METRICS_2', flush_frequency=30)

sess.set_params({'key': random.random()})

print(os.getpid())

for i in range(100, 200):
    sess.track(i, name='metric')
    sess.track(i*2, name='metric', subset='train', foo='baz')
    sess.track(i*3, name='metric', subset='test', bar='baz')
    sess2.track(i, name='metric', subset='train', bar='baz')
    time.sleep(1)
