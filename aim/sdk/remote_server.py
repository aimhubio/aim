import struct

from aim.ext.transport import server
from aim.sdk import Repo


def get_tree(name: bytes, sub: bytes, read_only: bytes, from_union: bytes, index: bytes, timeout: bytes):
    repo = Repo.default_repo()
    read_only = struct.unpack('?', read_only)[0]
    from_union = struct.unpack('?', from_union)[0]
    index = struct.unpack('?', index)[0]
    timeout = struct.unpack('I', timeout)[0]
    if index:
        return repo._get_index_tree(name.decode(), timeout)
    else:
        return repo.request_tree(name.decode(), sub.decode(), read_only=read_only, from_union=from_union)


def run():
    server.RemoteTrackingServicer.registry.register('TreeView', get_tree)
    server.run_server()


if __name__ == '__main__':
    run()
