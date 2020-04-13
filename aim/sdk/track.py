import atexit

from aim.engine.aim_repo import AimRepo
from aim.sdk.artifacts import *
from aim.sdk.artifacts.artifact_writer import ArtifactWriter
import aim.logger


repo = None


def get_repo():
    global repo
    if repo is None:
        # Get aim repo from working directory
        repo = AimRepo.get_working_repo()
        if repo is not None:
            # Finalize and close storage at program exit
            atexit.register(repo.close_records_storage)
    return repo


def track(name: str, *args, **kwargs):
    if name not in globals():
        print('Aim cannot track: \'{0}\''.format(name))
        return

    # Get corresponding class
    obj = globals()[name]

    # Create an instance
    inst = obj(*args, **kwargs)

    repo = get_repo()
    if not repo:
        print('Aim repository not found \n')
        return

    writer = ArtifactWriter()
    writer.save(repo, inst)

    return inst
