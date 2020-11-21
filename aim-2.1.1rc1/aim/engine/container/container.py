import subprocess

from aim.engine.configs import *
from aim.engine.utils import get_module


class AimContainer:
    _docker_client = None

    @staticmethod
    def is_docker_installed():
        try:
            docker = get_module('docker')
            client = docker.from_env()
            client.ping()
            return True
        except Exception:
            return False

    @staticmethod
    def get_image_name(version=AIM_CONTAINER_IMAGE_DEFAULT_TAG):
        return '{name}:{version}'.format(name=AIM_CONTAINER_IMAGE_NAME,
                                         version=version)

    @classmethod
    def _get_docker_client(cls):
        if cls._docker_client is None:
            docker = get_module('docker')
            cls._docker_client = docker.from_env()
        return cls._docker_client

    @classmethod
    def pull(cls, version=AIM_CONTAINER_IMAGE_DEFAULT_TAG) -> int:
        """
        Pulls image from docker hub and returns status
        """
        try:
            image_name = cls.get_image_name(version)
            command = 'docker pull {}'.format(image_name)
            subprocess.call(command.split(' '))
        except:
            return False
        return True

    @classmethod
    def image_exist(cls, version=AIM_CONTAINER_IMAGE_DEFAULT_TAG):
        """
        Returns whether image for aim board exists locally
        """
        images = cls._get_docker_client().images.list()
        for i in images:
            for t in i.attrs['RepoTags']:
                if t == cls.get_image_name(version):
                    return True

        return False

    def __init__(self, repo, dev=False):
        self.name = '{}_{}'.format(AIM_CONTAINER_PREFIX, repo.hash)
        self.ports = {}
        self.volumes = {
            repo.path: {'bind': '/store', 'mode': 'rw'},
            self.name: {'bind': '/var/lib/postgresql/data', 'mode': 'rw'},
        }
        self.env = [
            'PROJECT_NAME={}'.format(repo.name),
            'PROJECT_PATH={}'.format(repo.root_path),
        ]

        self.dev = dev

    def up(self, port, host, version):
        """
        Runs docker container in background mounted to aim repo.
        Returns `id` of the container or `None` if an error occurred.
        """

        self.bind(port, host)
        image_name = AIM_CONTAINER_IMAGE_DEV if self.dev \
            else self.get_image_name(version)

        docker_client = self._get_docker_client()
        container = docker_client.containers.run(image_name,
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

        docker_client = self._get_docker_client()
        containers = docker_client.containers.list(all=~running_only,
                                                   filters=filters)

        return containers[0] if len(containers) else None

    def kill(self) -> int:
        """
        Kills all containers with associated name
        Returns number of killed containers
        """
        # Filter containers by given name
        docker_client = self._get_docker_client()
        aim_containers = docker_client.containers.list(all=True, filters={
            'name': self.name,
        })

        # Kill and remove them
        count = 0
        for c in aim_containers:
            if c.status == 'running':
                count += 1
                c.kill()
            c.remove(force=True)

        return count

    def bind(self, port, host, to=None):
        host_interface = (host, port)
        if to is None:
            self.ports['80/tcp'] = host_interface
        else:
            self.ports['{}/tcp'.format(to)] = host_interface

    def mount_volume(self, path, mount_to):
        if path and mount_to and path not in self.volumes:
            self.volumes[path] = {
                'bind': mount_to,
                'mode': 'rw',
            }
