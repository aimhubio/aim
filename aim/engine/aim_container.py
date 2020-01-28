from aim.engine.configs import AIM_CONTAINER_PREFIX, AIM_CONTAINER_IMAGE


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

    def up(self):
        """
        Runs docker container in background mounted on aim repo
        Returns `id` of the container or `None` if an error occurred
        """
        import docker
        client = docker.from_env()

        try:
            container = client.containers.run(AIM_CONTAINER_IMAGE,
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
        import docker
        client = docker.from_env()

        # Filter containers with given name
        aim_containers = client.containers.list(filters={
            'name': self.name,
        })

        # Kill and remove them
        for c in aim_containers:
            try:
                c.kill()
                c.remove()
            except Exception:
                pass
