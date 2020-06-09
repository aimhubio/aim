import atexit

from aim.engine.aim_repo import AimRepo
from aim.sdk.artifacts import *
from aim.sdk.artifacts.artifact_writer import ArtifactWriter
import aim.logger
from aim.engine.configs import (
    AIM_BRANCH_ENV_VAR,
    AIM_COMMIT_ENV_VAR,
    AIM_AUTOMATED_EXEC_ENV_VAR,
)



repo = None


def get_repo():
    # Get ENV VARS
    branch_name = os.getenv(AIM_BRANCH_ENV_VAR)
    commit_hash = os.getenv(AIM_COMMIT_ENV_VAR)

    global repo
    if repo is None:
        # Get aim repo from working directory
        repo = AimRepo.get_working_repo(branch_name, commit_hash)
        if repo is not None:
            # Finalize and close storage at program exit
            atexit.register(repo.close_records_storage)
    return repo


def track(artifact_name: str, *args, **kwargs):
    if artifact_name not in globals():
        print('Aim cannot track: \'{0}\''.format(artifact_name))
        return

    # Get corresponding class
    obj = globals()[artifact_name]

    # Create an instance
    inst = obj(*args, **kwargs)

    repo = get_repo()
    if not repo:
        print('Aim repository not found \n')
        return

    writer = ArtifactWriter()
    writer.save(repo, inst)

    return inst
