from aim.engine.aim_repo import AimRepo


class Track:
    def __init__(self, tracking_obj, step=None):
        repo = AimRepo.get_working_repo()

        if not repo:
            print('Aim repository not found \n')
            return

        repo.objects_push(tracking_obj, step)
