import importlib
import json
import struct

from typing import Iterator, Tuple

from aim.storage.object import CustomObject
from aim.storage.treeutils import decode_tree, encode_tree  # noqa
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


def unpack_helper(msg: bytes) -> Tuple[bytes, bytes]:
    (key_size,), tail = struct.unpack('I', msg[:4]), msg[4:]
    key, tail = tail[:key_size], tail[key_size:]
    (is_blob,), tail = struct.unpack('?', tail[:1]), tail[1:]
    (value_size,), tail = struct.unpack('I', tail[:4]), tail[4:]
    value, tail = tail[:value_size], tail[value_size:]
    assert len(tail) == 0
    if is_blob:
        yield key, BLOB(data=value)
    else:
        yield key, value


def unpack_stream(stream) -> Tuple[bytes, bytes]:
    for msg in stream:
        yield from unpack_helper(msg)


def raise_exception(server_exception):
    module = importlib.import_module(server_exception.get('module_name'))
    exception = getattr(module, server_exception.get('class_name'))
    args = json.loads(server_exception.get('args') or [])
    raise exception(*args) if args else exception()


def build_exception(exception: Exception):
    return {
        'module_name': exception.__class__.__module__,
        'class_name': exception.__class__.__name__,
        'args': json.dumps(exception.args),
    }


@CustomObject.alias('aim.resource')
class ResourceObject(CustomObject):
    AIM_NAME = 'aim.resource'

    def __init__(self, handler):
        self.storage['handler'] = handler
