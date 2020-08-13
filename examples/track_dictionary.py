import aim
aim.init()


aim.set_params({
    'num_epochs': 10,
    'fc_units': 128,
}, name='hparams')

aim.set_params({
    'name': 'Dataset name',
    'version': 'Dataset version',
}, name='dataset')

aim.set_params({
    'foo': 'bar',
})
