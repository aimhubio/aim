from aim.sdk import select_runs


if __name__ == '__main__':
    runs = select_runs((
        'experiment == dash '
        'and hparams.num_epochs == 5 '
        'and run.loss < 1 '
    ))
    print(runs)
