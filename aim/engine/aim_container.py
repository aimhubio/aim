from aim.engine.configs import *
from aim.engine.utils import get_module


class AimContainer:
    @staticmethod
    def get_image_name(version=AIM_CONTAINER_IMAGE_DEFAULT_TAG):
        return '{name}:{version}'.format(name=AIM_CONTAINER_IMAGE_NAME,
                                         version=version)

    @staticmethod
    def is_docker_installed():
        # Check if docker is installed
        docker = get_module('docker')
        client = docker.from_env()

        try:
            client.ping()
            return True
        except:
            return False

    def __init__(self, repo, dev=False):
        self.name = '{}_{}'.format(AIM_CONTAINER_PREFIX, repo.hash)
        self.ports = {
            '{}/tcp'.format(AIM_BOARD_PORT_CLIENT): AIM_BOARD_PORT_CLIENT,
            '{}/tcp'.format(AIM_BOARD_PORT_SERVER): AIM_BOARD_PORT_SERVER,
            '{}/tcp'.format(AIM_BOARD_PORT_WS): AIM_BOARD_PORT_WS,
        }
        self.volumes = {
            repo.path: {'bind': '/store', 'mode': 'rw'},
        }
        self.env = ['PROJECT_NAME={}'.format(repo.name)]

        docker = get_module('docker')
        self.client = docker.from_env()

        self.dev = dev

    def up(self, version):
        """
        Runs docker container in background mounted to aim repo.
        Returns `id` of the container or `None` if an error occurred.
        """
        try:
            image_name = AIM_CONTAINER_IMAGE_DEV if self.dev \
                else self.get_image_name(version)
            container = self.client.containers.run(image_name,
                                                   name=self.name,
                                                   ports=self.ports,
                                                   volumes=self.volumes,
                                                   environment=self.env,
                                                   detach=True)
            return container.id
        except Exception:
            return None

    def kill(self):
        """
        KIlls all containers with associated name
        """
        # Filter containers with given name
        aim_containers = self.client.containers.list(filters={
            'name': self.name,
        })

        # Kill and remove them
        for c in aim_containers:
            try:
                c.kill()
                c.remove()
            except Exception:
                pass

    def pull(self, version=AIM_CONTAINER_IMAGE_DEFAULT_TAG):
        """
        Pulls latest image from docker hub and returns status
        """
        docker = get_module('docker')
        try:
            self.client.images.pull(self.get_image_name(version))
        except docker.errors.APIError:
            return False
        return True

    def image_exist(self, version=AIM_CONTAINER_IMAGE_DEFAULT_TAG):
        """
        Returns whether image for aim board exists locally
        """
        images = self.client.images.list()
        for i in images:
            for t in i.attrs['RepoTags']:
                if t == self.get_image_name(version):
                    return True

        return False
