import aim
import math


sess = aim.Session(experiment='test_floats')

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
    'nan_x': 'NaN',
    'inf_x': 'Infinity',
    'nan': float('nan'),
    'inf': float('inf'),
    'inf_in_nested_obj': (1, 2, 3, {
        'inf': math.inf,
    }),
    'nan_in_nested_obj': (1, 2, 3, {
        'nan': math.nan,
    }),
})

sess.track(1, name='test')
