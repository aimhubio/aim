import aim
from aim import track


aim.init()

track(aim.dictionary, {
    'num_epochs': 10,
    'fc_units': 128,
}, namespace='params')

track(aim.dictionary, {
    'name': 'Dataset name',
    'version': 'Dataset version',
}, namespace='dataset')

track(aim.dictionary, {
    'foo': 'bar',
})