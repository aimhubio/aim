from __future__ import print_function
# import docker
# import os

"""
    Deploys to docker as a docker api...
    all docker functionality is here
"""


class DockerDeploy():
    def __init__(self, model_path):
        self.model_path = model_path

    def build_image(self):
        image_name = 'aim-build-test'
        image_version = '0.1.0'
        image_tag = image_name + ':' + image_version
        # context_path = os.path.dirname(os.path.realpath(__file__))
        # client = docker.from_env()
        # build_params = {
        #     'path': context_path,
        #     'tag': image_tag,
        #     'quiet': False
        # }
        # docker_build = client.images.build(**build_params)
        # for line in docker_build[1]:
        #     # time.sleep(1)
        #     print(line)
        return image_tag


class DockerFilePaths():
    def __init__(self):
        pass
