import importlib
import json
import struct

from typing import Iterator, Tuple

from aim.storage.object import CustomObject
from aim.storage.treeutils import decode_tree as decode_tree
from aim.storage.treeutils import encode_tree as encode_tree
from aim.storage.types import BLOB


def pack_args(tree: Iterator[Tuple[bytes, bytes]]) -> bytes:
    result = []
    for key, val in tree:
        if not isinstance(val, BLOB):
            result.append(struct.pack('I', len(key)) + key + struct.pack('?', False) + struct.pack('I', len(val)) + val)
        else:
            val = val.load()
            result.append(struct.pack('I', len(key)) + key + struct.pack('?', True) + struct.pack('I', len(val)) + val)

    return b''.join(result)


def unpack_args(args: bytes) -> Tuple[bytes, bytes]:
    while args:
        (key_size,), args_tail = struct.unpack('I', args[:4]), args[4:]
        key, args_tail = args_tail[:key_size], args_tail[key_size:]
        (is_blob,), args_tail = struct.unpack('?', args_tail[:1]), args_tail[1:]
        (value_size,), args_tail = struct.unpack('I', args_tail[:4]), args_tail[4:]
        value, args_tail = args_tail[:value_size], args_tail[value_size:]
        args = args_tail
        if is_blob:
            yield key, BLOB(data=value)
        else:
            yield key, value


def pack_stream(tree: Iterator[Tuple[bytes, bytes]]) -> bytes:
    # TODO: [MV] check the performance diff of current version vs collecting the whole tree as a chunk
    for key, val in tree:
        if not isinstance(val, BLOB):
            yield struct.pack('I', len(key)) + key + struct.pack('?', False) + struct.pack('I', len(val)) + val
        else:
            val = val.load()
            yield struct.pack('I', len(key)) + key + struct.pack('?', True) + struct.pack('I', len(val)) + val


def unpack_stream(stream) -> Tuple[bytes, bytes]:
    for msg in stream:
        yield from unpack_args(msg)


def raise_exception(server_exception):
    from filelock import Timeout

    module = importlib.import_module(server_exception.get('module_name'))
    exception = getattr(module, server_exception.get('class_name'))
    args = json.loads(server_exception.get('args') or [])
    message = server_exception.get('message')

    # special handling for lock timeouts as they require lock argument which can't be passed over the network
    if exception == Timeout:
        raise Exception(message)

    raise exception(*args) if args else exception()


def build_exception(exception: Exception):
    return {
        'module_name': exception.__class__.__module__,
        'class_name': exception.__class__.__name__,
        'args': json.dumps(exception.args),
        'message': str(exception),
    }


@CustomObject.alias('aim.resource')
class ResourceObject(CustomObject):
    AIM_NAME = 'aim.resource'

    def __init__(self, handler):
        self.storage['handler'] = handler
