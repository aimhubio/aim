import aim
aim.init()


aim.track({
    'num_epochs': 10,
    'fc_units': 128,
}, namespace='params')

aim.track({
    'name': 'Dataset name',
    'version': 'Dataset version',
}, namespace='dataset')

aim.track({
    'foo': 'bar',
})