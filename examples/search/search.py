from aim.sdk import select


if __name__ == '__main__':
    res = select('loss if '
                 'run.hash == "35a6f076-e34c-11ea-9b10-8c8590970f67" '
                 'and run.archived is not True '
                 )

    print(res)
