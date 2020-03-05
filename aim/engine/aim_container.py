from aim.engine.configs import AIM_CONTAINER_PREFIX, AIM_CONTAINER_IMAGE
from aim.engine.utils import get_module


class AimContainer:
    def __init__(self, repo):
        self.name = '{}_{}'.format(AIM_CONTAINER_PREFIX, repo.hash[-22:])
        self.ports = {
            '8000/tcp': 8000,
            '8001/tcp': 8001,
        }
        self.volumes = {
            repo.path: {'bind': '/store', 'mode': 'rw'},
        }
        self.env = ['PROJECT_NAME={}'.format(repo.name)]

        docker = get_module('docker')
        self.client = docker.from_env()

    def up(self):
        """
        Runs docker container in background mounted on aim repo
        Returns `id` of the container or `None` if an error occurred
        """
        try:
            container = self.client.containers.run(AIM_CONTAINER_IMAGE,
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

    def pull(self):
        """
        Pulls latest image from docker hub and returns status
        """
        docker = get_module('docker')
        try:
            self.client.images.pull(AIM_CONTAINER_IMAGE)
        except docker.errors.APIError:
            return False
        return True

    def image_exist(self):
        """
        Returns whether image for aim board exists locally
        """
        images = self.client.images.list()
        for i in images:
            for t in i.attrs['RepoTags']:
                if t == AIM_CONTAINER_IMAGE:
                    return True

        return False
