from aim.engine.aim_repo import AimRepo


class LogMetric:
    def __init__(self, name, epoch, val):
        self.name = name
        self.epoch = epoch
        self.val = val

    def __call__(self, *args, **kwargs):
        return {
            'name': self.name,
            'epoch': self.epoch,
            'val': self.val,
        }


class LogLoss(LogMetric):
    NAME = 'loss'

    def __init__(self, epoch, val):
        super().__init__(self.NAME, epoch, val)


def save(obj):
    repo = AimRepo.get_working_repo()

    if isinstance(obj, LogLoss):
        repo.store_json('loss.json', {
            'epoch': obj.epoch,
            'val': obj.val,
        })
    else:
        pass
