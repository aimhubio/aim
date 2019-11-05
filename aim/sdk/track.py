from aim.engine.aim_repo import AimRepo
from aim.sdk.artifacts import *

import aim.logger


def track(name: str, *args, **kwargs):
    try:
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

        inst.save(repo)
        return inst
    except Exception as e:
        print('An error occured in Aim tracker and iterations are skipped')
        print('Please run tail aim log errors to view the error')
        error_logger = aim.logger.error_logger()
        error_logger.error('Tracker Error: ', e)
