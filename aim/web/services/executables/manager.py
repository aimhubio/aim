from queue import Queue
import threading
from time import sleep

from aim.web.utils import Singleton
from aim.web.services.executables.server import Server


class Executables(metaclass=Singleton):
    def __init__(self):
        self._server = None
        self._actions_queue = Queue()
        self._exec_commands = threading.Thread(target=self._exec_commands_body,
                                               daemon=True)
        self._exec_started = False
        self._results = {}

    def start(self):
        if self._server is None:
            self._server = Server()

        if not self._exec_started:
            self._exec_commands.start()
            self._exec_started = True

    def stop(self):
        if self._server is not None:
            self._server.close()
            self._server = None

        if self._exec_started:
            self._exec_commands.join()
            self._exec_started = False

    def add(self, action, block=False):
        self._actions_queue.put(action)

        if block:
            timeout = 0
            while True:
                if block is not True and timeout > block:
                    return None
                try:
                    return self._results[action.id]
                except:
                    timeout += 0.01
                    sleep(0.01)

    def _exec_commands_body(self):
        while True:
            action = self._actions_queue.get()
            if action:
                res = self._server.send_line(action.serialize())
                self._results[action.id] = res
