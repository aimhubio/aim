from aim import Session

sess1 = Session(experiment_name='a12')
sess2 = Session(experiment_name='b12')

sess1.set_params({
    'foo': 'bar',
})
sess2.set_params({
    'bar': 'baz',
})

for i in range(10):
    sess1.track(i, name='val')
    sess2.track(i, name='val')
