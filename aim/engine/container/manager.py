import socket
from time import sleep
import json
from base64 import b64decode
import threading

from aim.engine.container.command import Command


class AimContainerCommandManager:
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
