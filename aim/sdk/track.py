import atexit
import socket
import psutil

from aim.engine.aim_repo import AimRepo
from aim.artifacts import *
from aim.artifacts.artifact_writer import ArtifactWriter
import aim.logger
from aim.engine.configs import (
    AIM_BRANCH_ENV_VAR,
    AIM_COMMIT_ENV_VAR,
    AIM_AUTOMATED_EXEC_ENV_VAR,
)


repo = None

# HOST = '127.0.0.1'
HOST = '0.0.0.0'
PORT = 43815
connected = False
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((HOST, PORT))
    connected = True
except:
    print("Socket connects failed. Running process without real-time update.")


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
    artifact_type = None
    artifact_epoch = None
    value = None

    if not len(args):
        print('Artifact is not specified')

    if isinstance(args[0], str):
        artifact_type = args[0]
    elif isinstance(args[0], int) or isinstance(args[0], float):
        # Autodetect Metric artifact
        artifact_type = aim.metric
        kwargs['value'] = args[0]
        value = args[0]
        artifact_name = kwargs['name']
        artifact_epoch = kwargs['epoch']
        args = []
    elif isinstance(args[0], dict):
        # Autodetect Dictionary(Map) artifact
        artifact_type = aim.dictionary
        kwargs['value'] = args[0]
        value = args[0]
        args = []

    if artifact_type is None or artifact_type not in globals():
        print('Aim cannot track: \'{0}\''.format(artifact_type))
        return

    # Get corresponding class
    obj = globals()[artifact_type]

    # Create an instance
    inst = obj(*args, **kwargs)

    repo = get_repo()
    if not repo:
        print('Aim repository not found \n')
        return

    writer = ArtifactWriter()
    writer.save(repo, inst)

    if connected:
        data = {
            "pid": psutil.Process().pid,
            "artifact_type": artifact_type,
            "artifact_name": artifact_name,
            "value": value,
            "artifact_epoch": artifact_epoch
        }

        s.sendall(bytes(json.dumps(data) + "\n", "utf-8"))

    return inst
