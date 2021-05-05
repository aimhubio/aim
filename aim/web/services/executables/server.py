import socket
from time import sleep

from aim.web.utils import Singleton


class Server(metaclass=Singleton):
    def __init__(self, port=None):
        self.port = port or 43803
        self.host = '0.0.0.0'
        self.sock = None
        self.conn = None

    def close(self):
        if self.conn:
            self.conn.close()

        if self.sock:
            self.sock.close()

    def listen(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.bind((self.host, self.port))
        self.sock.listen(1)

    def send_line(self, line):
        if not line.endswith('\n'):
            line += '\n'

        if not self.sock:
            self.listen()

        while True:
            try:
                if not self.conn:
                    self.conn, _ = self.sock.accept()

                self.conn.send(line.encode())
                res = self.read_line()
                if res:
                    return res
            except Exception as e:
                self.conn.close()
                self.conn = None
                sleep(0.1)

    def read_line(self):
        # if not self.conn:
        #     return None

        buffer_size = 4096
        buffer = self.conn.recv(buffer_size).decode('utf-8')
        buffering = True
        while buffering:
            if '\n' in buffer:
                (line, buffer) = buffer.split('\n', 1)
                return line + '\n'
            else:
                more = self.conn.recv(buffer_size).decode('utf-8')
                if not more:
                    buffering = False
                else:
                    buffer += more
        if buffer:
            return buffer
        return None
