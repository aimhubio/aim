from aim.sdk import select_runs


if __name__ == '__main__':
    runs = select_runs((
        'experiment == keras '
        'and hparams.num_epochs >= 0.001 '
    ))
    print(runs)
