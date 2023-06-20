import random


def random_list(length: int):
    return [random.random() for _ in range(length)]


def random_value():
    return random.random()


def random_generator(length: int = 100):
    for _ in range(length):
        yield random.random()
