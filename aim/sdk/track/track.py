from aim.engine.aim_repo import AimRepo
from aim.sdk.track.metric import Metric, Accuracy


class Track:
    def __init__(self, obj, step=None):
        if isinstance(obj, Metric):
            repo = AimRepo.get_working_repo()

            if not repo:
                print('Aim repository not found \n')
                return

            repo.add_object_val(obj.name, obj.val, step)
