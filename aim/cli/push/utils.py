import struct


def send_flags_file(client, path):
    client.send_line(path.encode())
    client.send(struct.pack('>i', 1) + struct.pack('>i', 0) + b'\n')
