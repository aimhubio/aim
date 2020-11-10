import aim
import math


sess = aim.Session(experiment='test_params')

sess.set_params({
    'num_epochs': 10,
    'fc_units': 128,
}, name='hparams')

sess.set_params({
    'name': 'Dataset name',
    'version': 'Dataset version',
}, name='dataset')

sess.set_params({
    'foo': 'bar',
})

sess.set_params({
    'inf': float('inf'),
    'inf_in_nested_obj': (1, 2, 3, {
        'inf': math.inf,
    }),
})
