from __future__ import print_function
from aim.engine.aim_model import AimModel
from aim.deploy.docker.docker_ops_prep import DockerOps
from aim.deploy.docker.server_prep import ServerFiles
from aim.deploy.docker.utils import Paths
import docker
import os

"""
    Deploys to docker as a docker api...
    all docker functionality is here
"""


class DockerDeploy():
    def __init__(self, model_path, build_dir):
        self.model_path = model_path
        self.build_dir = build_dir
        self.paths = Paths(self.build_dir, self.model_path)

    def _model_dest_name(self):
        """ Return dest and name of model """
        # TODO: perform all sorts of checks here
        dest, name = os.path.split(self.model_path)
        name = ''.join(i for i in name.split('.')[0:-1])
        return (dest, name)

    def set_img_name(self, name):
        # TODO: organize random name
        self.image_name = name
        return self

    def set_img_version(self, version):
        # TODO: set latest if no version is provided
        self.image_version = version
        return self

    # generate the files needed for the image to be built
    def generate_files(self):
        dest, name = self._model_dest_name()
        am = AimModel.load_model(dest, name)
        docker_ops = DockerOps(self.paths)
        server_prep = ServerFiles(self.paths)

        docker_ops.flush_tmp_dir()
        docker_ops.save_dockerfile()
        docker_ops.save_requirements()
        docker_ops.save_model(am)

        server_prep.save_app()

    def build_image(self):
        self.generate_files()
        image_tag = self.image_name + ':' + self.image_version

        context_path = self.paths.build_dir
        client = docker.from_env()
        build_params = {
            'path': context_path,
            'tag': image_tag,
            'quiet': False
        }
        docker_build = client.images.build(**build_params)
        for line in docker_build[1]:
            # time.sleep(1)
            print(line)
        return image_tag
