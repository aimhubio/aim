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

    def write_line(self, message):
        """
        Send string to file server over tcp connection
        """
        try:
            self.sock.send((str(message) + "\n").encode())
            data = self.sock.recv(1024)
            return data
        except Exception:
            return False

    def write_bytes(self, bytes_msg):
        """
        Send bytes message to file server over tcp connection
        """
        try:
            self.sock.send(bytes_msg)
            return True
        except Exception:
            return False
