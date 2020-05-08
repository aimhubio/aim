import aim
aim.init()

from aim import track


track(aim.hyperparams, {
    'num_epochs': 10,
    'fc_units': 128,
})

track(aim.dataset, {
    'name': 'Dataset name',
    'version': 'Dataset version',
})
