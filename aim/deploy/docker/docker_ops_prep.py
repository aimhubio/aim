from __future__ import print_function
from aim.deploy.docker.configs import *
from jinja2 import Template
from shutil import copyfile, rmtree
import os


# Takes care of saving the operations files for docker image building
# All flat in one directory.
class DockerOps():
    def __init__(self, paths):
        self.cwd = os.path.dirname(os.path.realpath(__file__))
        self.paths = paths

    # Flush the directory before saving the files.
    def flush_tmp_dir(self, cleanup=False):
        if os.path.exists(os.path.normpath(self.paths.build_dir)):
            rmtree(os.path.normpath(self.paths.build_dir))
        if cleanup is False:
            os.mkdir(self.paths.build_dir)

    def save_dockerfile(self):
        dest, model = self.paths.model_dest_name()
        dockerfile_template = self.paths.dockerfile_path
        dict = {
            'onnx_model': model + '.onnx'
        }
        with open(dockerfile_template, 'r') as dockerfile:
            template = Template(dockerfile.read())
            prepped_dockerfile = template.render(dict)

        dockerfile_dest_path = os.path.normpath(
            '{}/{}'.format(self.paths.build_dir, DOCKERFILE_BUILD))
        with open(dockerfile_dest_path, 'w') as dest_file:
            dest_file.write(prepped_dockerfile)
        return self

    def save_requirements(self):
        req_src_path = os.path.normpath('{}/{}'.format(
            self.paths.ops_path, REQUIREMENTS_TEMPLATE))
        req_dest_path = os.path.normpath('{}/{}'.format(
            self.paths.build_dir, '/requirements.txt'))
        copyfile(req_src_path, req_dest_path)
        return self

    def save_model(self, aim_model):
        src, model = self.paths.model_dest_name()

        aim_model.serialize_onnx(self.paths.build_dir, model)
        return self
