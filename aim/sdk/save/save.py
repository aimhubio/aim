from aim.engine.aim_repo import AimRepo


def save(obj):
    repo = AimRepo.get_working_repo()

    if not repo:
        print('Aim repository not found \n')
        return

    repo.objects_push(obj)
