import struct

import cython

from .utils import ArrayFlag, ObjectFlag

from typing import List, Tuple, Union


_PATH_SENTINEL = b'\xfe'
_SIZE_T = 'q'

_NONE = 0
_BOOL = 1
_INT = 2  # Stored as 64-bit Long Long
_FLOAT = 3  # Stored as 64-bit Double
_STRING = 4
_BYTES = 5
_ARRAY = 6
_OBJECT = 7

# ARRAY_FLAG = object()
# OBJECT_FLAG = object()

# Handling `None`

# @overload
@cython.cfunc
@cython.returns(bytes)
@cython.exceptval(check=False)
def encode_none(value) -> bytes:
    return b""


@cython.cfunc
@cython.exceptval(check=False)
def decode_none(buffer: bytes):
    return None

# Handling `bool`


# def encode_bool(value: bool) -> bytes:
#     return struct.pack('?', value)


@cython.cfunc
@cython.locals(value=cython.bint)
@cython.returns(bytes)
@cython.exceptval(check=False)
def encode_bool(value: bool) -> bytes:
    return struct.pack('?', value)
    # return c_encoding.encode_bool(value)


@cython.cfunc
@cython.locals(buffer=bytes)
@cython.returns(cython.bint)
@cython.exceptval(check=False)
def decode_bool(buffer: bytes) -> bool:
    return struct.unpack('?', buffer)[0]

# Handling `int`


@cython.cfunc
@cython.locals(value=cython.int)
@cython.returns(bytes)
@cython.exceptval(check=False)
def encode_int(value: int) -> bytes:
    # TODO handle numpy scalars maybe?
    return struct.pack('q', value)


@cython.cfunc
@cython.locals(buffer=bytes)
@cython.returns(cython.int)
@cython.exceptval(check=False)
def decode_int(buffer: bytes) -> int:
    if len(buffer) == struct.calcsize('q'):
        return struct.unpack('q', buffer)[0]
    elif len(buffer) == struct.calcsize('l'):
        return struct.unpack('l', buffer)[0]
    elif len(buffer) == struct.calcsize('h'):
        return struct.unpack('h', buffer)[0]
    else:
        raise NotImplementedError

# Handling `float`


@cython.cfunc
@cython.locals(value=cython.double)
@cython.returns(bytes)
@cython.exceptval(check=False)
def encode_float(value: float) -> bytes:
    # TODO handle numpy scalars maybe?
    return struct.pack('d', value)


@cython.cfunc
@cython.locals(buffer=bytes)
@cython.returns(cython.double)
@cython.exceptval(check=False)
def decode_float(buffer: bytes) -> float:
    if len(buffer) == struct.calcsize('d'):
        return struct.unpack('d', buffer)[0]
    elif len(buffer) == struct.calcsize('f'):
        return struct.unpack('f', buffer)[0]
    elif len(buffer) == struct.calcsize('e'):
        return struct.unpack('e', buffer)[0]
    else:
        raise NotImplementedError

# Handling `str`


@cython.cfunc
@cython.locals(value=str)
@cython.returns(bytes)
@cython.exceptval(check=False)
def encode_str(value: str) -> Tuple[int, bytes]:
    return value.encode('utf-8')


@cython.cfunc
@cython.locals(buffer=bytes)
@cython.returns(str)
@cython.exceptval(check=False)
def decode_str(buffer: bytes) -> str:
    return buffer.decode('utf-8')

# Handling `bytes`


@cython.cfunc
@cython.locals(value=bytes)
@cython.returns(bytes)
@cython.exceptval(check=False)
def encode_bytes(value: bytes) -> Tuple[int, bytes]:
    return value


@cython.cfunc
@cython.locals(buffer=bytes)
@cython.returns(bytes)
@cython.exceptval(check=False)
def decode_bytes(buffer: bytes) -> bytes:
    return buffer


@cython.cfunc
@cython.exceptval(check=False)
def encode_detect(value):  # -> Tuple[int, bytes]:
    if value is None:
        type_id = _NONE
        encoding = encode_none(value)
    elif value is bool:
        type_id = _BOOL
        encoding = encode_bool(value)
    elif isinstance(value, int):
        type_id = _INT
        encoding = encode_int(value)
    elif isinstance(value, float):
        type_id = _FLOAT
        encoding = encode_float(value)
    elif isinstance(value, str):
        type_id = _STRING
        encoding = encode_str(value)
    elif isinstance(value, bytes):
        type_id = _BYTES
        encoding = encode_bytes(value)
    elif value is ArrayFlag:
        type_id = _ARRAY
        encoding = b""
    elif value is ObjectFlag:
        type_id = _OBJECT
        encoding = b""
    else:
        raise NotImplementedError

    return type_id, encoding


@cython.cfunc
@cython.locals(buffer=bytes)
@cython.exceptval(check=False)
def decode_detect(type_id: int, buffer: bytes):
    if type_id == _NONE:
        value = decode_none(buffer)
    elif type_id == _BOOL:
        value = decode_bool(buffer)
    elif type_id == _INT:
        value = decode_int(buffer)
    elif type_id == _FLOAT:
        value = decode_float(buffer)
    elif type_id == _STRING:
        value = decode_str(buffer)
    elif type_id == _BYTES:
        value = decode_bytes(buffer)
    elif type_id == _ARRAY:
        value = ArrayFlag
    elif type_id == _OBJECT:
        value = ObjectFlag
    else:
        raise NotImplementedError

    return value


@cython.ccall
@cython.returns(bytes)
@cython.exceptval(check=False)
def encode(value) -> bytes:
    type_id, encoding = encode_detect(value)
    type_byte = struct.pack('B', type_id)
    return type_byte + encoding


@cython.ccall
@cython.locals(buffer=bytes)
@cython.exceptval(check=False)
def decode(buffer: bytes):
    type_byte = buffer[:1]
    buffer = buffer[1:]
    type_id = struct.unpack('B', type_byte)[0]
    value = decode_detect(type_id, buffer)
    return value


@cython.cfunc
@cython.locals(value=cython.int)
@cython.returns(bytes)
@cython.exceptval(check=False)
def encode_size_t(value: int) -> bytes:
    # We fix it to long long to preserve compatibility
    # across different systems
    # Integer indices may be also keys for dicts
    # so we prefer supporting negative indices
    return struct.pack(_SIZE_T, value)


@cython.cfunc
@cython.locals(buffer=bytes)
@cython.returns(cython.int)
@cython.exceptval(check=False)
def decode_size_t(buffer: bytes) -> int:
    return struct.unpack(_SIZE_T, buffer)[0]


def encode_key(key: Union[int, str]) -> bytes:
    if isinstance(key, str):
        encoded = encode_str(key)
        if _PATH_SENTINEL in encoded:
            raise ValueError(f"The keys may not contain `{_PATH_SENTINEL}`. "
                             f"The provided key was: {key}")
        return encoded
    elif isinstance(key, int):
        return _PATH_SENTINEL + struct.pack('>q', key)   # encode_size_t(key)
    else:
        raise ValueError(f'Value {key} of type {type(key)} is not supported')


def decode_key(buffer: bytes) -> Union[str, int]:
    # We better decode the path in whole
    raise NotImplementedError


def encode_path(path: Tuple[Union[str, int], ...] = ()) -> bytes:
    if not isinstance(path, (list, tuple)):
        path = [path]
    return b''.join(
        encode_key(key) + _PATH_SENTINEL
        for key in path
    )


def decode_path_slow(buffer: bytes) -> Tuple[Union[str, int], ...]:
    path: List[Union[str, int]] = []

    while buffer:
        if buffer.startswith(_PATH_SENTINEL):
            key_size = struct.calcsize(_SIZE_T)
            key_buffer = buffer[1:key_size + 1]
            # print(key_buffer)
            # buffer[key_size + 1] is the _PATH_SENTINEL
            buffer = buffer[key_size + 2:]
            # key = decode_size_t(key_buffer)
            key, = struct.unpack('>q', key_buffer)
        else:
            key, _, buffer = buffer.partition(_PATH_SENTINEL)
            key = key.decode('utf-8')

        path.append(key)

    return tuple(path)

from .encoding_native import decode_path
