import os
import uuid
import time

from aim.engine.aim_repo import AimRepo


def init(overwrite=False):
    # Init repo if doesn't exist and return repo instance
    repo = AimRepo.get_working_repo()
    if not repo:
        repo = AimRepo(os.getcwd())
        repo.init()

    # Check if repo index is empty or not
    # Reset index or commit according to `overwrite` argument
    if not repo.is_index_empty():
        if overwrite:
            repo.reset_index()
        else:
            repo.commit(str(uuid.uuid1()), int(time.time()))
