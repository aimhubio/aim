import random
import os

import aim


print(os.getpid())

sess = aim.Session(experiment='test_par_plot', flush_frequency=10)

sess.set_params({
    'foo': random.random() * 100,
    'bar': random.random() * 100,
    'baz': random.random() * 100,
})

for i in range(100, 200):
    sess.track(i, name='metric')
    sess.track(i*2, name='metric', subset='train', foo='baz')
    sess.track(i*3, name='metric', subset='test', bar='baz')
