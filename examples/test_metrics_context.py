import aim


if __name__ == '__main__':
    aim.init()

    aim.track({
        'num_epochs': 5,
        'lr': 10,
    }, namespace='hparams')

    for e in range(5):
        for i in range(50):
            aim.track(i, name='loss', epoch=e, subset='train', subtask='lm')
            aim.track(i, name='acc', epoch=e, subset='train', subtask='lm')
            if i % 10 == 0:
                aim.track(i, name='loss', epoch=e, subset='val', subtask='lm')
                aim.track(i, name='acc', epoch=e, subset='val', subtask='lm')

    for e in range(5):
        for i in range(50):
            aim.track(i, name='loss', epoch=e, subset='train', subtask='nmt')
            aim.track(i, name='acc', epoch=e, subset='train', subtask='nmt')
            if i % 10 == 0:
                aim.track(i, name='loss', epoch=e, subset='val', subtask='nmt')
                aim.track(i, name='acc', epoch=e, subset='val', subtask='nmt')
