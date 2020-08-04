from aim.sdk.search import search


if __name__ == '__main__':
    res = search('loss where params.learning_rate == 0.01 and params.num_epochs == 5')
    print(res)
