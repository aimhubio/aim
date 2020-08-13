import atexit

from aim.engine.repo import AimRepo
from aim.artifacts import *
from aim.artifacts.artifact_writer import ArtifactWriter
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


def track(*args, **kwargs):
    artifact_name = None

    if not len(args):
        print('Artifact is not specified')

    if isinstance(args[0], str):
        artifact_name = args[0]
    elif isinstance(args[0], int) or isinstance(args[0], float):
        # Autodetect Metric artifact
        artifact_name = aim.metric
        kwargs['value'] = args[0]
        args = []
    elif isinstance(args[0], dict):
        # Autodetect Dictionary(Map) artifact
        artifact_name = aim.dictionary
        kwargs['value'] = args[0]
        args = []

    if artifact_name is None or artifact_name not in globals():
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
