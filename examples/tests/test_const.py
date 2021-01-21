import aim
import random
import os


exp1_run1 = aim.Session(experiment='test_const', flush_frequency=10)

exp1_run1.set_params({
    'foo': random.random() * 100,
    'bar': random.random() * 100,
    'baz': random.random() * 100,
})

for i in range(100, 200):
    exp1_run1.track(3.45, name='const3')
