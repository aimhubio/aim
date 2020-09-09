from aim import Session

sess1 = Session(experiment='line')
sess2 = Session(experiment='linex2')

sess1.set_params({
    'k': '1',
})
sess2.set_params({
    'k': '2',
})

for i in range(10):
    sess1.track(i, name='val')
    sess2.track(i*2, name='val')
