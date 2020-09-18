from aim.sdk import select_metrics


if __name__ == '__main__':
    metrics = select_metrics((
        'loss if '
        '   run.archived is False '
        '   and run.loss.train > 0.01 '
    ))
    print(metrics)
