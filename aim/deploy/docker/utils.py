from __future__ import print_function
from aim.deploy.docker.configs import *
import os


class Paths():
    def __init__(self, build_dir, model_path):
        self.cwd = os.path.dirname(os.path.realpath(__file__))
        self.build_dir = build_dir
        self.model_path = model_path
        self.ops_path = os.path.normpath('{}/{}'.format(self.cwd, OPS_DIR))
        self.srvr_files_path = os.path.normpath(
            '{}/{}'.format(self.cwd, SERVER_FILES_DIR))
        self.dockerfile_path = os.path.normpath(
            '{}/{}'.format(self.ops_path, DOCKER_FILE_TEMPLATE))

    def model_dest_name(self, with_extension=False):
        """ Return dest and name of model """
        # TODO: perform all sorts of checks here
        dest, name = os.path.split(self.model_path)
        if with_extension is False:
            name = ''.join(i for i in name.split('.')[0:-1])
        return (dest, name)
