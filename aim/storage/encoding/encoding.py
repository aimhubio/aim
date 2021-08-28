from aim.storage.types import AimObjectKey, AimObjectPath
import struct

from aim.storage.encoding.encoding_native import *  # noqa
from aim.storage.utils import ArrayFlag, ObjectFlag

from typing import Union, Any


_PATH_SENTINEL = b'\xfe'

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

# cdef inline bytes encode_none():
#     return b""


def encode(value: Any) -> bytes:
    if value is None:
        type_id = _NONE
        encoding = b""
    elif value is bool:
        type_id = _BOOL
        encoding = b'\x01' if value else b'\x00'
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
        encoding = value
    elif value is ArrayFlag:
        type_id = _ARRAY
        encoding = b""
    elif value is ObjectFlag:
        type_id = _OBJECT
        encoding = b""
    else:
        type_id = _NONE
        encoding = b""

    type_byte = bytes([type_id])
    return type_byte + encoding


def decode(buffer: bytes):
    type_id = buffer[0]
    buffer = buffer[1:]

    if type_id == _NONE:
        return None
    elif type_id == _BOOL:
        return buffer[0] != 0
    elif type_id == _INT:
        return decode_int(buffer)
    elif type_id == _FLOAT:
        return decode_float(buffer)
    elif type_id == _STRING:
        return decode_str(buffer)
    elif type_id == _BYTES:
        return buffer
    elif type_id == _ARRAY:
        return ArrayFlag
    elif type_id == _OBJECT:
        return ObjectFlag
    else:
        return None


_struct_q_be = struct.Struct('>q')


def encode_key(key: Union[int, str]):
    if isinstance(key, str):
        encoded = encode_str(key)
        # if _PATH_SENTINEL in encoded:
        #     raise ValueError(f"The keys may not contain `{_PATH_SENTINEL}`. "
        #                      f"The provided key was: {key}")
        return encoded
    elif isinstance(key, int):
        return _PATH_SENTINEL + _struct_q_be.pack(key)
    else:
        raise ValueError(f'Value {key} of type {type(key)} is not supported')


def encode_path(path: Union[AimObjectKey, AimObjectPath] = ()):
    if isinstance(path, (int, str)):
        path = (path,)
    return b''.join([encode_key(key) + _PATH_SENTINEL for key in path])
