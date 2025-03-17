# distutils: language = c++
# cython: language_level = 3

"""Encodings for primitive values for AimObject-compatible data.

This includes None, booleans, integer and floating-point numbers, strings,
byte-array blobs and control flags for array and dict-like objects.

The encodings are implemented `(key, value)` design in mind, so using them to
stream and store in chunks is easy to manage.
"""

from aim.storage.encoding.encoding_native cimport PATH_SENTINEL_CODE
from aim.storage.encoding.encoding_native cimport (
    encode_int64,
    encode_double,
    encode_utf_8_str,
    encode_int64_big_endian,
)
from aim.storage.encoding.encoding_native cimport (
    decode_int64,
    decode_double,
    decode_utf_8_str,
)
from aim.storage.encoding.encoding_native cimport decode_path  # noqa: F401
from aim.storage.utils import ArrayFlagType, ObjectFlagType, CustomObjectFlagType
from aim.storage.utils import ArrayFlag, ObjectFlag
from aim.storage.container import ContainerValue
from aim.storage.types import AimObjectKey, AimObjectPath
from aim.storage.types import BLOB

from typing import Union, Any

# The choice of `PATH_SENTINEL` is not arbitrary.
# This sentinel 1) consists of a single byte
#               2) does not appear in any utf-8 encoded string
#               3) comes right before max byte 0xff which make a room for
#                  many tricks
_PATH_SENTINEL = b'\xfe'
assert _PATH_SENTINEL[0] == PATH_SENTINEL_CODE


cpdef object encode(object value):
    """Automatically detect and encode the value into a buffer.
    This function is to encode only primitive objects.

    Type id of the value is encoded with the content as well in order to enable
    automatic decoding.
    The first byte of the buffer encodes type of the encoded value and the rest
    are for encoded content.
    """
    cdef int type_id
    cdef bytes encoding

    if isinstance(value, BLOB):
        return value.transform(encode)

    if value is None:
        # No need to encode a content for None-values
        type_id = FLAGS._NONE
        encoding = b''
    elif isinstance(value, bool):
        # Booleans are encoded in a single byte
        # 0 and 1 for False and True respectively
        type_id = FLAGS._BOOL
        encoding = b'\x01' if value else b'\x00'
    elif isinstance(value, int):
        # We encode integers in signed 64-bit
        type_id = FLAGS._INT
        encoding = encode_int64(value)
    elif isinstance(value, float):
        # We encode floats in double-precision
        type_id = FLAGS._FLOAT
        encoding = encode_double(value)
    elif isinstance(value, str):
        # Strings are stored in utf-8
        type_id = FLAGS._STRING
        encoding = encode_utf_8_str(value)
    elif isinstance(value, bytes):
        # Byte arrays / BLOBS can be used to encode arbitrary binary content
        type_id = FLAGS._BYTES
        encoding = value
    elif isinstance(value, ArrayFlagType):
        # Array flag is used to denote non-finised object, expecting
        # encodings for its elements
        type_id = FLAGS._ARRAY
        encoding = b''
    elif isinstance(value, ObjectFlagType):
        # Object flag is used to denote non-finised object, expecting
        # encodings for its elements
        type_id = FLAGS._OBJECT
        encoding = b''
    elif isinstance(value, CustomObjectFlagType):
        type_id = FLAGS._CUSTOM_OBJECT
        encoding = encode_utf_8_str(value.aim_name)
    else:
        raise NotImplementedError

    # Finally, we prepend the content `encoding` with a single byte which
    # encodes the type of the value
    cdef char* prefix = [type_id]
    return <bytes>prefix[:1] + encoding


cpdef object decode(object buffer):
    """Automatically detect and decode the value from a buffer."""

    if isinstance(buffer, BLOB):
        return buffer.transform(decode)

    # First, we extract type_id and the content buffer
    cdef int type_id = buffer[0]
    cdef bytes content_buffer = buffer[1:]
    # TODO pass the whole buffer to decode_* functions with offset

    # We check for type_id and decode the content for the corresponding type
    if type_id == FLAGS._NONE:
        return None
    elif type_id == FLAGS._BOOL:
        return content_buffer[0] != 0
    elif type_id == FLAGS._INT:
        return decode_int64(content_buffer)
    elif type_id == FLAGS._FLOAT:
        return decode_double(content_buffer)
    elif type_id == FLAGS._STRING:
        return decode_utf_8_str(content_buffer)
    elif type_id == FLAGS._BYTES:
        return content_buffer
    elif type_id == FLAGS._ARRAY:
        return ArrayFlag
    elif type_id == FLAGS._OBJECT:
        return ObjectFlag
    elif type_id == FLAGS._CUSTOM_OBJECT:
        return CustomObjectFlagType(decode_utf_8_str(content_buffer))
    else:
        return None


cpdef bytes encode_key(object key):
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
    prefix = <object>bytes([PATH_SENTINEL_CODE])
    if isinstance(key, str):
        encoded = encode_utf_8_str(<str>key)
        return encoded
    elif isinstance(key, int):
        return prefix + encode_int64_big_endian(key)
    else:
        raise ValueError(f'Value {key} of type {type(key)} is not supported')


cpdef bytes encode_path(object path):
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
    cdef tuple path_tuple
    if isinstance(path, (int, str)):
        path_tuple = (path,)
    elif isinstance(path, list):
        path_tuple = tuple(path)
    elif isinstance(path, tuple):
        path_tuple = path
    else:
        raise ValueError(f'Value {path} of type {type(path)} is not supported')
    return b''.join([encode_key(key) + _PATH_SENTINEL for key in path_tuple])
