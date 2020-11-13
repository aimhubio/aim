import random
import time
import os

import aim


sess = aim.Session(experiment='test_par_plot', flush_frequency=10)

sess.set_params({
    'foo': random.random() * 100,
    'bar': random.random() * 100,
    'baz': random.random() * 100,
})

print(os.getpid())

for i in range(100, 200):
    sess.track(i, name='metric')
    sess.track(i*2, name='metric', subset='train')
    sess.track(i*3, name='metric', subset='test')
