import hashlib
import struct

from aim.storage.hashing import c_hash
from aim.storage.types import AimObject, AimObjectArray, AimObjectKey, AimObjectDict, NoneType

from typing import Tuple, Union

_HASH_DTYPE = 'q'
_HASH_SIZE = struct.calcsize(_HASH_DTYPE)

_HASH_NONE = 1393794177995070132


def pack_hash(q: int) -> bytes:
    return struct.pack(_HASH_DTYPE, q)


def unpack_hash(q: bytes) -> int:
    return struct.unpack(_HASH_DTYPE, q)[0]


_HASH_UNIFORM_SALT = pack_hash(-7494597716789683807)
_HASH_ARRAY_SALT = pack_hash(2965039128708897743)
_HASH_OBJECT_SALT = pack_hash(-2435585119574290752)
_HASH_STR_SALT = pack_hash(7540324813251503183)
_HASH_BYTES_SALT = pack_hash(-6836296829636613855)

_HASH_RESERVED_SEED_5 = 2677878696559815000  # TODO NaN
_HASH_RESERVED_SEED_4 = -3823593693375925613
_HASH_RESERVED_SEED_3 = -8686979383495812702
_HASH_RESERVED_SEED_2 = -111243618272990777
_HASH_RESERVED_SEED_1 = -2446756774877533613


def hash_none(obj: NoneType = None) -> int:
    return _HASH_NONE


def hash_uniform(bad_hash: int) -> int:
    state = hashlib.blake2b(pack_hash(bad_hash),
                            digest_size=_HASH_SIZE,
                            salt=_HASH_UNIFORM_SALT)
    return unpack_hash(state.digest())


def hash_number(number: Union[int, float]) -> int:
    state = c_hash.det_hash(number)

    return hash_uniform(state)


def hash_bool(obj: bool) -> int:
    return hash_number(0) if not obj else hash_number(1)


# @cython.cfunc
# @cython.locals(x=int)
# @cython.returns(x=int)
def hash_int(obj: int) -> int:
    return hash_number(obj)


def hash_float(obj: float) -> int:
    return hash_number(obj)


def hash_bytes(obj: bytes) -> int:
    state = hashlib.blake2b(obj,
                            digest_size=_HASH_SIZE,
                            salt=_HASH_BYTES_SALT)
    return unpack_hash(state.digest())


def hash_string(obj: str) -> int:
    state = hashlib.blake2b(obj.encode('utf-8'),
                            digest_size=_HASH_SIZE,
                            salt=_HASH_STR_SALT)
    return unpack_hash(state.digest())


def hash_array(obj: AimObjectArray) -> int:
    state = hashlib.blake2b(digest_size=_HASH_SIZE,
                            salt=_HASH_ARRAY_SALT)
    for i in obj:
        piece_hash = hash_auto(i)
        state.update(pack_hash(piece_hash))

    return unpack_hash(state.digest())


def key_cmp(obj: Tuple[AimObjectKey, AimObject]):
    key, _ = obj
    return hash_auto(key)


def hash_object(obj: AimObjectDict) -> int:

    state = hashlib.blake2b(digest_size=_HASH_SIZE,
                            salt=_HASH_OBJECT_SALT)
    for key_val_tuple in sorted(obj.items(), key=key_cmp):
        piece_hash = hash_array(key_val_tuple)
        state.update(pack_hash(piece_hash))

    return unpack_hash(state.digest())


def hash_auto(obj: AimObject) -> int:
    if obj is None:
        return hash_none()
    elif isinstance(obj, bool):
        return hash_bool(obj)
    elif isinstance(obj, int):
        return hash_int(obj)
    elif isinstance(obj, float):
        return hash_float(obj)
    elif isinstance(obj, bytes):
        return hash_bytes(obj)
    elif isinstance(obj, str):
        return hash_string(obj)
    elif isinstance(obj, (tuple, list)):
        return hash_array(obj)
    elif isinstance(obj, dict):
        return hash_object(obj)
    else:
        raise NotImplementedError
