from __future__ import print_function
from aim.deploy.docker.configs import *
from shutil import copyfile
import os


# Takes care of saving the files for the Neural Network Server.
class ServerFiles():
    def __init__(self, paths):
        self.paths = paths

    def _copy(self, f_name):
        src_path = os.path.normpath(
            self.paths.srvr_files_path + '/' + f_name)
        dest_path = os.path.normpath(
            self.paths.build_dir + '/' + f_name)
        copyfile(src_path, dest_path)

    def save_app(self):
        self._copy(WEB_APP_TEMPLATE)
