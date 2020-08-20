import aim

aim.set_params({
    'foo': 'bar',
})

for i in range(10):
    aim.track(i, name='val')
