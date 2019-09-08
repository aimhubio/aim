class Metric:
    def __init__(self, name, val):
        self.name = name
        self.val = val

    def __call__(self):
        return self.name, self.val


class Accuracy(Metric):
    NAME = 'accuracy'

    def __init__(self, val):
        super().__init__(self.NAME, val)


class Loss(Metric):
    NAME = 'loss'

    def __init__(self, val):
        super().__init__(self.NAME, val)
