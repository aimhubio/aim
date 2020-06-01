import shlex
import subprocess
import socket
import threading
from time import sleep

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
        except BaseException:
            return False

    def __init__(self, repo, dev=False):
        self.name = '{}_{}'.format(AIM_CONTAINER_PREFIX, repo.hash)
        self.ports = {}
        self.volumes = {
            repo.path: {'bind': '/store', 'mode': 'rw'},
        }
        self.env = ['PROJECT_NAME={}'.format(repo.name)]

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

    def add_port(self, port):
        self.ports['80/tcp'] = port


class AimContainerCMD:
    commands = {}

    def __init__(self, port):
        self.port = port
        self.sock = None
        self._listenerd = None
        self._shutdown = False
        self._reconnect = True

    def listen(self):
        self._listenerd = threading.Thread(target=self._listener_body,
                                           daemon=True)
        self._shutdown = False
        self.sock = None
        self._listenerd.start()

    def kill(self):
        self._shutdown = True
        self.sock.close()

    def _listener_body(self):
        while True:
            if self._shutdown:
                return

            try:
                if self.sock is None:
                    if not self._reconnect:
                        return

                    self.sock = socket.socket(socket.AF_INET,
                                              socket.SOCK_STREAM)
                    self.sock.settimeout(120)
                    self.sock.connect(('0.0.0.0', self.port))

                line = self._read_line()
                if line:
                    self.sock.send(b'ok')
                    self._exec_command(line)
                else:
                    raise ValueError
            except:
                self.sock = None
                sleep(0.1)

    def _read_line(self):
        buffer_size = 4096
        buffer = self.sock.recv(buffer_size).decode('utf-8')
        buffering = True
        while buffering:
            if '\n' in buffer:
                (line, buffer) = buffer.split('\n', 1)
                return line + '\n'
            else:
                more = self.sock.recv(buffer_size).decode('utf-8')
                if not more:
                    buffering = False
                else:
                    buffer += more
        if buffer:
            return buffer
        else:
            return ''

    def _exec_command(self, command_line):
        command = Command(command_line)
        command_pid = command.start()
        self.commands[command_pid] = command


class Command:
    def __init__(self, command_line):
        self.command_line = command_line
        self.process = None
        self.pid = None
        self.stdout = None
        self.stderr = None
        self._thread = threading.Thread(target=self._exec, daemon=True)

    def start(self):
        self._thread.start()
        while True:
            if self.pid:
                return self.pid
            else:
                sleep(0.01)

    def _exec(self):
        args = shlex.split(self.command_line)
        self.process = subprocess.Popen(args,
                                        shell=False,
                                        stdout=subprocess.PIPE,
                                        stderr=subprocess.PIPE,
                                        stdin=subprocess.PIPE,
                                        # preexec_fn=self.preexec
                                        )
        self.pid = self.process.pid
        self.stdout, self.stderr = self.process.communicate()

    # def preexec(self):
    #     # Don't forward signals.
    #     import os
    #     os.setpgrp()
