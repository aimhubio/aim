import random
import os

import aim


sess = aim.Session(experiment='TEST_METRICS_3', flush_frequency=10)
sess2 = aim.Session(experiment='TEST_METRICS_3', flush_frequency=30)

sess.set_params({'key': random.random()})
sess2.set_params({'key': random.random()})

print(os.getpid())

for i in range(100, 200):
    sess.track(i, name='metric')
    sess.track(i*2, name='metric', subset='train', foo='baz')
    sess.track(i*3, name='metric', subset='test', bar='baz')
    sess2.track(i*4, name='metric', subset='train', bar='baz')
