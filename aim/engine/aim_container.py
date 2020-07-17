import os
import shlex
import psutil
import signal
import subprocess
import socket
import threading
from time import sleep
import json
from base64 import b64decode

from aim.engine.configs import *
from aim.engine.utils import get_module
from aim.engine.aim_repo import AimRepo


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


class AimContainerCMD:
    commands = {}

    def __init__(self, port):
        self.port = port
        self.sock = None
        self._listenerd = None
        self._shutdown = False
        self._reconnect = True
        self._commands = []

    def listen(self):
        self._listenerd = threading.Thread(target=self._listener_body,
                                           daemon=True)
        self._shutdown = False
        self.sock = None
        self._listenerd.start()

    def kill(self):
        self._shutdown = True
        if self.sock:
            self.sock.close()
        for p in self._commands:
            p.kill()

    def event(self, data):
        parsed_data = b64decode(data.encode('utf-8')).decode('utf-8')
        parsed_data = json.loads(parsed_data)
        res = {
            'status': 200,
        }
        if parsed_data['action'] == 'execute':
            command = Command(parsed_data['data'])
            command_pid = command.start()
            self._commands.append(command)
            res['pid'] = command_pid
        elif parsed_data['action'] == 'kill':
            for p in self._commands:
                if str(p.pid) == parsed_data['data']['pid']:
                    p.kill()
                    self._commands.remove(p)
            res['pid'] = parsed_data['data']['pid']
        elif parsed_data['action'] == 'select':
            res['processes'] = []
            for p in self._commands:
                if not p.alive:
                    self._commands.remove(p)
            for p in self._select_commands(parsed_data.get('data')):
                res['processes'].append({
                    'pid': p.pid,
                    'process_uuid': p.process_uuid,
                    'name': p.name,
                    'script_path': p.script_path,
                    'arguments': p.arguments,
                    'interpreter_path': p.interpreter_path,
                    'working_dir': p.working_dir,
                    'env_vars': p.env_vars,
                    'command': p.command,
                })
        else:
            res = {
                'status': 500,
            }
        return json.dumps(res)

    def _select_commands(self, filters=None):
        if filters is None:
            return self._commands

        result = []
        experiment = filters.get('experiment')
        commit = filters.get('commit_hash')

        for p in self._commands:
            if experiment is not None \
                    and experiment != p.automated_info['automated_branch']:
                continue

            if commit is not None \
                    and commit != p.automated_info['automated_commit']:
                continue

            result.append(p)

        return result

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
                    # self.sock.settimeout(120)
                    self.sock.connect(('0.0.0.0', self.port))

                line = self._read_line()
                if line:
                    res = self.event(line)
                    self._send_line(res)
                else:
                    raise ValueError('empty message')
            except Exception as e:
                # print(e)
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

    def _send_line(self, line):
        if not line.endswith('\n'):
            line += '\n'

        self.sock.send(line.encode())


class Command:
    def __init__(self, data):
        self.name = data.get('name')
        self.script_path = data.get('script_path')
        self.arguments = data.get('arguments')
        self.interpreter_path = data.get('interpreter_path')
        self.working_dir = data.get('working_dir')
        self.process_uuid = data.get('process_uuid')

        # Parse env vars
        parsed_vars = self._parse_env_vars(data.get('env_vars'))
        self.automated_info = parsed_vars
        self.env_vars = parsed_vars['env_vars']

        self.command = self.build_command()

        self.process = None
        self.pid = None
        self.stdout = None
        self.stderr = None
        self.alive = True
        self._thread = threading.Thread(target=self._exec, daemon=True)

    def start(self):
        self._thread.start()
        while True:
            if self.pid:
                return self.pid
            else:
                sleep(0.01)

    def kill(self):
        try:
            current_process = psutil.Process(self.pid)
            children = current_process.children(recursive=True)
            for child in children:
                os.kill(child.pid, signal.SIGINT)
            os.kill(self.pid, signal.SIGINT)
            self._thread.join()
        except Exception as e:
            pass
        self.alive = False

    def build_command(self):
        script_path = self.script_path
        arguments = self.arguments or ''
        interpreter_path = self.interpreter_path or 'python'
        env_vars = self.env_vars

        work_dir = ''
        if self.working_dir:
            work_dir = 'cd {} && '.format(self.working_dir)

        command = ('{work_dir} {env_vars} {interpt} ' +
                   '{script_path} {arguments}').format(work_dir=work_dir,
                                                       env_vars=env_vars,
                                                       interpt=interpreter_path,
                                                       script_path=script_path,
                                                       arguments=arguments)
        return command

    def _parse_env_vars(self, env_vars):
        env_vars = env_vars or ''
        env_vars_arr = env_vars.split(' ')
        filtered_env_vars = []

        automated = False
        automated_branch = None
        automated_commit = None
        for e in env_vars_arr:
            if AIM_AUTOMATED_EXEC_ENV_VAR in e:
                automated = True
            elif AIM_BRANCH_ENV_VAR in e:
                _, _, automated_branch = e.rpartition('=')
            else:
                filtered_env_vars.append(e)

        if automated:
            if not automated_branch:
                automated_branch = AIM_DEFAULT_BRANCH_NAME
            automated_commit = AimRepo.generate_commit_hash()

            filtered_env_vars.append('{}={}'.format(AIM_BRANCH_ENV_VAR,
                                                    automated_branch))
            filtered_env_vars.append('{}={}'.format(AIM_COMMIT_ENV_VAR,
                                                    automated_commit))
            filtered_env_vars.append('{}={}'.format(AIM_PROCESS_ENV_VAR,
                                                    self.process_uuid))
            filtered_env_vars.append('{}=1'.format(AIM_AUTOMATED_EXEC_ENV_VAR))

        return {
            'env_vars': ' '.join(filtered_env_vars),
            'automated': automated,
            'automated_branch': automated_branch,
            'automated_commit': automated_commit,
        }

    def _exec(self):
        self.process = subprocess.Popen(self.command,
                                        shell=True,
                                        stdout=subprocess.PIPE,
                                        stderr=subprocess.PIPE,
                                        stdin=subprocess.PIPE,
                                        # preexec_fn=self.preexec
                                        )
        self.pid = self.process.pid
        self.stdout, self.stderr = self.process.communicate()
        self.alive = False

    # def preexec(self):
    #     # Don't forward signals.
    #     import os
    #     os.setpgrp()
