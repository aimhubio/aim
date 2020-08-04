from aim.sdk import select


if __name__ == '__main__':
    res = select('loss where hparams.learning_rate == 0.01 and hparams.num_epochs in (5, 10)')
    print(res)
