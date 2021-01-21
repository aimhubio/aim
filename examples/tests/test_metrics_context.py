import aim


sess = aim.Session(experiment='test_metrics_context', flush_frequency=10)

sess.set_params({
    'num_epochs': 5,
    'lr': 10,
}, name='hparams')

for e in range(5):
    for i in range(50):
        sess.track(i, name='loss', epoch=e, subset='train', subtask='lm')
        sess.track(i, name='acc', epoch=e, subset='train', subtask='lm')
        if i % 10 == 0:
            sess.track(i, name='loss', epoch=e, subset='val', subtask='lm')
            sess.track(i, name='acc', epoch=e, subset='val', subtask='lm')

for e in range(5):
    for i in range(50):
        sess.track(i, name='loss', epoch=e, subset='train', subtask='nmt')
        sess.track(i, name='acc', epoch=e, subset='train', subtask='nmt')
        if i % 10 == 0:
            sess.track(i, name='loss', epoch=e, subset='val', subtask='nmt')
            sess.track(i, name='acc', epoch=e, subset='val', subtask='nmt')
