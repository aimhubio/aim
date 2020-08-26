from aim.sdk import select


if __name__ == '__main__':
    res = select('loss if '
                 'experiment == test_indicator and run.archived is True'
                 )

    print(res)
