from aim import Session

sess = Session()

sess.set_params({
    'foo': 'bar',
})

for i in range(10):
    sess.track(i, name='val')
