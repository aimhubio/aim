import os
import socket
import math
import struct
import paramiko

from aim.engine.configs import AIM_PROFILE_NAME, AIM_PROFILE_SSH_DIR_NAME


class FileServerClient:
    def __init__(self, address, port, key_path, print_func):
        """
        Opens tcp/ip socket to address:port
        """
        self.address = address
        self.port = port
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((self.address, self.port))
        self.t = paramiko.Transport(self.sock)

        try:
            self.t.start_client()
        except paramiko.SSHException:
            raise ConnectionError('SSH negotiation failed')

        try:
            keys = paramiko.util.load_host_keys(
                os.path.join(os.path.expanduser('~/'),
                             AIM_PROFILE_NAME,
                             AIM_PROFILE_SSH_DIR_NAME,
                             'known_hosts')
            )
        except IOError:
            raise ConnectionError('Unable to open host keys file')

        # Check server's host key
        # TODO: automatically save server key in `known_hosts` file
        key = self.t.get_remote_server_key()
        if self.address not in keys:
            pass
            # print_func('*** WARNING: Unknown host key! ***')
        elif key.get_name() not in keys[self.address]:
            pass
            # print_func('*** WARNING: Unknown host key! ***')
        elif keys[self.address][key.get_name()] != key:
            raise ConnectionError('*** WARNING: Host key has changed ***')

        try:
            key = paramiko.RSAKey.from_private_key_file(key_path)
        except FileNotFoundError:
            raise FileNotFoundError('Private key not found')

        self.t.auth_publickey('aim', key)

        self.chan = self.t.open_session()

    def close(self):
        """
        Closes the transport channel and connection
        """
        try:
            self.chan.close()
            self.t.close()
            self.sock.close()
        except Exception:
            return False

        return True

    def receive_str(self, buf=1024):
        """
        Receives a string from the server
        """
        try:
            data = self.chan.recv(buf)
            return str(data.decode())
        except Exception:
            return False

    def send(self, message):
        """
        Sends a message to the server
        """
        try:
            while not self.chan.send_ready():
                pass

            self.chan.sendall(message)
            return True
        except Exception:
            return False

    def send_line(self, message):
        """
        Sends exactly one line to the server
        """
        try:
            self.chan.send(message)
            self.chan.send("\n".encode())
            return self.receive_str()
        except Exception:
            return False


class File:
    def __init__(self, path, chunk_size=4*1024*1024):
        self.path = path
        self.file = open(path, 'rb')
        self.content = self.file.read()
        self.content_len = len(self.content)
        self.chunk_size = chunk_size

    def __iter__(self):
        self.content_pointer = 0
        self.left_content_len = self.content_len
        self.chunk_len = len(self)
        self.chunks_left = self.chunk_len

        return self

    def __next__(self):
        """
        Returns the next chunk header information and body
        """
        if self.chunks_left <= 0:
            self.file.close()
            raise StopIteration()

        if self.left_content_len > self.chunk_size:
            curr_chunk_size = self.chunk_size
        else:
            curr_chunk_size = self.left_content_len

        # Convert the number of remaining chunks and
        # current chunk size to 4-len bytes
        curr_chunk_size_b = struct.pack('>i', curr_chunk_size)
        chunks_left_b = struct.pack('>i', self.chunks_left)

        # Get appropriate chunk body from content slice
        chunk_body_b = self.content[self.content_pointer:
                                    self.content_pointer + curr_chunk_size]

        # Implode chunk header and body
        # Header contains (the number of remaining chunks)[4B]
        # and (current chunk size)[4B]
        #
        # +-------------------------------------------+
        # |    HEADER    |           |      BODY      |
        # +----+    +----+           +---------------+
        # | 4B |----| 4B |-----------| {chunk_size} B |
        # +----+    +----+           +----------------+
        #
        chunk = (curr_chunk_size_b +
                 chunks_left_b +
                 chunk_body_b)

        self.left_content_len -= curr_chunk_size
        self.content_pointer += curr_chunk_size
        self.chunks_left -= 1

        return chunk

    def __len__(self):
        return math.ceil(self.content_len/self.chunk_size)

    @staticmethod
    def empty_chunk():
        return (struct.pack('>i', 1) +
                struct.pack('>i', 0) +
                b'\n')

    def format_size(self):
        """
        Returns file size in human readable format
        """
        return math.ceil(self.content_len/1024)
