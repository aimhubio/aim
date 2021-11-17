"""Encodings for primitive values for AimObject-compatible data.

This includes None, booleans, integer and floating-point numbers, strings,
byte-array blobs and control flags for array and dict-like objects.

The encodings are implemented `(key, value)` design in mind, so using them to
stream and store in chunks is easy to manage.
"""

from aim.storage.encoding.encoding_native import PATH_SENTINEL_CODE
from aim.storage.encoding.encoding_native import (
    encode_int64,
    encode_double,
    encode_utf_8_str,
    encode_int64_big_endian,
)
from aim.storage.encoding.encoding_native import (
    decode_int64,
    decode_double,
    decode_utf_8_str,
)
from aim.storage.encoding.encoding_native import decode_path  # noqa F401
from aim.storage.utils import ArrayFlag, ArrayFlagType, ObjectFlag, ObjectFlagType, CustomObjectFlagType
from aim.storage.types import AimObjectKey, AimObjectPath
from aim.storage.container import ContainerValue
from aim.storage.types import BLOB

from typing import Union, Any

# The choice of `PATH_SENTINEL` is not arbitrary.
# This sentinel 1) consists of a single byte
#               2) does not appear in any utf-8 encoded string
#               3) comes right before max byte 0xff which make a room for
#                  many tricks
_PATH_SENTINEL = b'\xfe'
assert _PATH_SENTINEL[0] == PATH_SENTINEL_CODE

# We define a mapping for primitive types into a single bit
# The types are going to be stored in a single byte, so 7 more bits are reserved
_NONE = 0
_BOOL = 1
_INT = 2
_FLOAT = 3
_STRING = 4
_BYTES = 5
_ARRAY = 6
_OBJECT = 7
_CUSTOM_OBJECT = 8 | 7


def encode(value: Any) -> ContainerValue:
    """Automatically detect and encode the value into a buffer.
    This function is to encode only primitive objects.

    Type id of the value is encoded with the content as well in order to enable
    automatic decoding.
    The first byte of the buffer encodes type of the encoded value and the rest
    are for encoded content.
    """
    if isinstance(value, BLOB):
        return value.transform(encode)

    if value is None:
        # No need to encode a content for None-values
        type_id = _NONE
        encoding = b''
    elif value is bool:
        # Booleans are encoded in a single byte
        # 0 and 1 for False and True respectively
        type_id = _BOOL
        encoding = b'\x01' if value else b'\x00'
    elif isinstance(value, int):
        # We encode integers in signed 64-bit
        type_id = _INT
        encoding = encode_int64(value)
    elif isinstance(value, float):
        # We encode floats in double-precision
        type_id = _FLOAT
        encoding = encode_double(value)
    elif isinstance(value, str):
        # Strings are stored in utf-8
        type_id = _STRING
        encoding = encode_utf_8_str(value)
    elif isinstance(value, bytes):
        # Byte arrays / BLOBS can be used to encode arbitrary binary content
        type_id = _BYTES
        encoding = value
    elif isinstance(value, ArrayFlagType):
        # Array flag is used to denote non-finised object, expecting
        # encodings for its elements
        type_id = _ARRAY
        encoding = b''
    elif isinstance(value, ObjectFlagType):
        # Object flag is used to denote non-finised object, expecting
        # encodings for its elements
        type_id = _OBJECT
        encoding = b''
    elif isinstance(value, CustomObjectFlagType):
        type_id = _CUSTOM_OBJECT
        encoding = encode_utf_8_str(value.aim_name)
    else:
        raise NotImplementedError

    # Finally, we prepend the content `encoding` with a single byte which
    # encodes the type of the value
    type_byte = bytes([type_id])
    return type_byte + encoding


def decode(buffer: ContainerValue):
    """Automatically detect and decode the value from a buffer."""

    if isinstance(buffer, BLOB):
        return buffer.transform(decode)

    # First, we extract type_id and the content buffer
    type_id = buffer[0]
    buffer = buffer[1:]

    # We check for type_id and decode the content for the corresponding type
    if type_id == _NONE:
        return None
    elif type_id == _BOOL:
        return buffer[0] != 0
    elif type_id == _INT:
        return decode_int64(buffer)
    elif type_id == _FLOAT:
        return decode_double(buffer)
    elif type_id == _STRING:
        return decode_utf_8_str(buffer)
    elif type_id == _BYTES:
        return buffer
    elif type_id == _ARRAY:
        return ArrayFlag
    elif type_id == _OBJECT:
        return ObjectFlag
    elif type_id == _CUSTOM_OBJECT:
        return CustomObjectFlagType(decode_utf_8_str(buffer))
    else:
        return None


def encode_key(key: Union[int, str]):
    """Encode the value as key in the path.

    This is different from what the general `encode()` will result.
    Here we omit type_id for strings to avoid redundancies, and add an
    additional path sentinel for numeric (integer) ones.
    Integers are encoded in big-endian to make the encoded keys to preserve
    the relative order when comparing as byte array buffers in lexicographic
    order.
    For example, `1000 > 249` but having them encoded in little-endian may have
    lead their encoded versions not to maintain the relative order:
    `b'\\xe8\\x03\\x00\\x00\\x00\\x00\\x00\\x00' < b'\\xf9\\x00\\x00\\x00\\x00\\x00\\x00\\x00'`
    However, in big-endiang encoding:
    `b'\\x00\\x00\\x00\\x00\\x00\\x00\\x03\\xe8' > b'\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\xf9'`
    """
    if isinstance(key, str):
        encoded = encode_utf_8_str(key)
        return encoded
    elif isinstance(key, int):
        return _PATH_SENTINEL + encode_int64_big_endian(key)
    else:
        raise ValueError(f'Value {key} of type {type(key)} is not supported')


def encode_path(path: Union[AimObjectKey, AimObjectPath] = ()):
    """Encode the path into a buffer.
    The encoding of path is designed to effectively use prefix-trees that may
    be used by storage engines.

    The path is encoded as concatenation of encoded keys, separated with
    so-called `PATH_SENTINEL`.
    Keys can be either strings or integers:
      *  Strings keys are encoded in utf-8. Any non-empty string is allowed as
         a path key, containing of any characters. There is no risk of
         ambiguous encodings because the `PATH_SENTINEL` is chosen such it can
         never be occurred in correctly encoded utf-8 string. Such key may
         include even `PATH_SENTINEL` as it is encoded using other bytes.
      *  Integers are encoded in signed 64-bit integers, and a `PATH_SENTINEL`
         is prepended.
    If the key encoding starts with the `PATH_SENTINEL` it can only encode an
    integer, as 1) no utf-8 encoded string may start with `PATH_SENTINEL`
                2) the empty strings are not allowed
    """
    if isinstance(path, (int, str)):
        path = (path,)
    return b''.join([encode_key(key) + _PATH_SENTINEL for key in path])
