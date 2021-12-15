import struct
from typing import Iterator, Tuple

import aim.ext.transport.remote_tracking_pb2 as rpc_messages
from aim.storage.types import BLOB


def pack(tree: Iterator[Tuple[bytes, bytes]]) -> bytes:
    for key, val in tree:
        if not isinstance(val, BLOB):
            yield struct.pack('I', len(key)) + key + struct.pack('?', False) + struct.pack('I', len(val)) + val
        else:
            val = val.load()
            yield struct.pack('I', len(key)) + key + struct.pack('?', True) + struct.pack('I', len(val)) + val


def unpack(stream: Iterator[bytes]) -> Tuple[bytes, bytes]:
    for msg in stream:
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


def unpack_request_data(stream: Iterator[rpc_messages.ResourceRequest]) -> Tuple[bytes, bytes]:
    for msg in stream:
        assert msg.WhichOneof('instruction') == 'message'
        msg = msg.message
        (key_size,), tail = struct.unpack('I', msg[:4]), msg[4:]
        key, tail = tail[:key_size], tail[key_size:]
        (is_blob,), tail = struct.unpack('?', tail[:1]), tail[1:]
        (value_size,), tail = struct.unpack('I', tail[:4]), tail[4:]
        value, tail = tail[:value_size], tail[value_size:]
        assert len(tail) == 0
        if is_blob:
            yield key, BLOB(value)
        else:
            yield key, value


def unpack_response_data(stream: rpc_messages.ResourceResponse) -> Tuple[bytes, bytes]:
    for msg in stream:
        assert msg.WhichOneof('instruction') == 'message'
        msg = msg.message
        (key_size,), tail = struct.unpack('I', msg[:4]), msg[4:]
        key, tail = tail[:key_size], tail[key_size:]
        (is_blob,), tail = struct.unpack('?', tail[:1]), tail[1:]
        (value_size,), tail = struct.unpack('I', tail[:4]), tail[4:]
        value, tail = tail[:value_size], tail[value_size:]
        assert len(tail) == 0
        if is_blob:
            yield key, BLOB(value)
        else:
            yield key, value
