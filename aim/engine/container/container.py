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
        except Exception:
            return False

    def __init__(self, repo, dev=False):
        self.name = '{}_{}'.format(AIM_CONTAINER_PREFIX, repo.hash)
        self.ports = {}
        self.volumes = {
            repo.path: {'bind': '/store', 'mode': 'rw'},
            repo.name: {'bind': '/var/lib/postgresql/data', 'mode': 'rw'},
        }
        self.env = [
            'PROJECT_NAME={}'.format(repo.name),
            'PROJECT_PATH={}'.format(repo.root_path),
        ]

        docker = get_module('docker')
        self.client = docker.from_env()

        self.dev = dev

    def up(self, port, version):
        """
        Runs docker container in background mounted to aim repo.
        Returns `id` of the container or `None` if an error occurred.
        """

        self.add_port(port)
        image_name = AIM_CONTAINER_IMAGE_DEV if self.dev \
            else self.get_image_name(version)
        container = self.client.containers.run(image_name,
                                               name=self.name,
                                               ports=self.ports,
                                               volumes=self.volumes,
                                               environment=self.env,
                                               detach=True)
        return container.id

    def get_container(self, running_only=False):
        filters = {
            'name': self.name,
        }
        if running_only:
            filters['status'] = 'running'
        containers = self.client.containers.list(all=~running_only,
                                                 filters=filters)
        if len(containers):
            return containers[0]
        return None

    def kill(self):
        """
        KIlls all containers with associated name
        """
        # Filter containers with given name
        aim_containers = self.client.containers.list(all=True, filters={
            'name': self.name,
        })

        # Kill and remove them
        for c in aim_containers:
            if c.status == 'running':
                c.kill()
            c.remove(force=True)

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

    def add_port(self, port, to=None):
        if to is None:
            self.ports['80/tcp'] = port
        else:
            self.ports['{}/tcp'.format(to)] = port

    def mount_volume(self, path, mount_to):
        if path and mount_to and path not in self.volumes:
            self.volumes[path] = {
                'bind': mount_to,
                'mode': 'rw',
            }
