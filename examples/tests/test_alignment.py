import aim
import random
import math


epochs = 4
steps = 30
c_step = 100

sess = aim.Session(experiment='test_epoch_alignment_x', flush_frequency=10)

sess.set_params({
    'name': 'Dataset name',
    'version': 'Dataset version',
}, name='dataset')

sess.set_params({
    'epochs': epochs,
    'steps': steps,
    'c_step': c_step,
}, name='hparmas')

sess.set_params({
    'foo': random.random() * 100,
    'bar': random.random() * 100,
    'baz': random.random() * 100,
    'cluster': int(random.random() * 3),
    'nested': {
        'arr': ['aa', 'bb', 'cc'],
        'obj': {
            'foo': 'bar',
        },
        'nan_in_nested_obj': (1, 2, 3, {
            'nan': math.nan,
        }),
    },
})

for e in range(epochs):
    if e == 2:
        c_steps = c_step
    else:
        c_steps = None
    for i in range(c_steps or steps):
        sess.track(random.random() * 100, name='epoch_metric', epoch=e, subset='train')
    sess.track(random.random() * 100, name='epoch_metric', epoch=e, subset='val')
