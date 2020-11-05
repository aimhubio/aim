import random
import time
import os

import aim


sess = aim.Session(experiment='TEST_METRICS')

sess.set_params({'key': random.random()})

print(os.getpid())

for i in range(100, 4000):
    print(i, i*2, i*3)
    sess.track(i, name='metric')
    sess.track(i*2, name='metric', subset='train', sub=12)
    sess.track(i*3, name='metric', subset='test', aab=22)
    time.sleep(0.1)
