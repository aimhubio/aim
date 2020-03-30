from aim.engine.aim_repo import AimRepo
from aim.sdk.artifacts import *
from aim.sdk.artifacts.artifact_writer import ArtifactWriter

import aim.logger


def track(name: str, *args, **kwargs):
    if name not in globals():
        print('Aim cannot track: \'{0}\''.format(name))
        return

    # Get corresponding class
    obj = globals()[name]

    # Create an instance
    inst = obj(*args, **kwargs)

    # Get aim repo from working directory
    repo = AimRepo.get_working_repo()

    if not repo:
        print('Aim repository not found \n')
        return

    writer = ArtifactWriter()
    writer.save(repo, inst)
    return inst
