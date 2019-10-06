import socket


class FileserverClient:
    def __init__(self, address, port):
        """
        Create tcp/ip socket
        And connect to the address:port
        """
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((address, port))

    def close(self):
        self.sock.close()

    def write(self, message):
        """
        Send a message to server over tcp connection
        """
        try:
            self.sock.send(message)
            return self.read()
        except Exception:
            return False

    def write_line(self, message):
        try:
            self.sock.send(message)
            self.sock.send("\n".encode())
            return self.read()
        except Exception:
            return False

    def read(self, buf=1024):
        """
        Read a message from server over tcp connection
        """
        try:
            data = self.sock.recv(buf)
            return str(data.decode())
        except Exception:
            return False
