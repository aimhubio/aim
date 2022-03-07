"""Hashing implementations of AimObject-compatible data.
This is different from CPython's implementation because of many reasons:
  *  CPython uses non-deterministic hashing to avoid collision attacks.
     Although we also cover such scenarios, in contrast to CPython, we do not
     use PYTHONHASHSEED environment variable.
  *  We implement hash for mutable objects as well (`list`, `dict`, etc.)
  *  Our implementation are less prone to manually designed collisions.
"""

import hashlib

from aim.storage.encoding import encode_int64, decode_int64  # noqa
from aim.storage.hashing import c_hash
from aim.storage.types import AimObject, AimObjectArray, AimObjectKey, AimObjectDict, NoneType

from typing import Tuple, Union


# We use 8-byte digest for Aim hashes
_HASH_SIZE = 8

# Here we fix hash seeds for primitive types
_HASH_NONE = 1393794177995070132

_HASH_UNIFORM_SALT = encode_int64(-7494597716789683807)
_HASH_ARRAY_SALT = encode_int64(2965039128708897743)
_HASH_OBJECT_SALT = encode_int64(-2435585119574290752)
_HASH_STR_SALT = encode_int64(7540324813251503183)
_HASH_BYTES_SALT = encode_int64(-6836296829636613855)


def hash_none(obj: NoneType = None) -> int:
    """Hash None values."""
    # We hard-code the hash value of None
    return _HASH_NONE


def hash_uniform(bad_hash: int) -> int:
    """Make a uniform permutation for mapping to make it more or less
    cryptographically stable, so it's more difficult to manually or (by chance
    in real applications) craft / find such examples that `a != b` but
    `hash(a) == hash(b)`
    """
    state = hashlib.blake2b(encode_int64(bad_hash),
                            digest_size=_HASH_SIZE,
                            salt=_HASH_UNIFORM_SALT)
    return decode_int64(state.digest())


def hash_number(number: Union[int, float]) -> int:
    """Hash a numeric value.

    As in Python, we make sure that `hash(a) == hash(b)` when `a == b` even if
    `a` and `b` are of different types (e.g. `int` vs `float`).
    In contrast to CPython implementation, our hash does not map integers to
    themselves making them more robust for different hasing scenarios.
    """
    state = c_hash.det_hash(number)
    return hash_uniform(state)


def hash_bool(obj: bool) -> int:
    """Hash a boolean value.

    We make sure that `hash(False) == hash(0) != hash(1) == hash(True)` similar
    to Python hash.
    """
    return hash_number(0) if not obj else hash_number(1)


def hash_bytes(obj: bytes) -> int:
    """Hash an `bytes` buffer"""
    # We use `blake2b` to hash the `bytes` object
    state = hashlib.blake2b(obj,
                            digest_size=_HASH_SIZE,
                            salt=_HASH_BYTES_SALT)
    return decode_int64(state.digest())


def hash_string(obj: str) -> int:
    """Hash an string object"""
    # Similar to `bytes`, we use `blake2b` to hash strings as well
    # First, we encode them to `utf-8` and then compute the hash
    # but *a different hash seed is provided* to make sure strings and their
    # utf-8 encoded blobs do not map to the same hash.
    state = hashlib.blake2b(obj.encode('utf-8'),
                            digest_size=_HASH_SIZE,
                            salt=_HASH_STR_SALT)
    return decode_int64(state.digest())


def hash_array(obj: AimObjectArray) -> int:
    """Hash an array of objects.

    We do not take into account whether it is a `list` or `tuple`, so
    `hash([1, 2, ['x', 5]]) == hash((1, 2, ('x', 5)))`
    """
    state = hashlib.blake2b(digest_size=_HASH_SIZE,
                            salt=_HASH_ARRAY_SALT)
    for i in obj:
        piece_hash = hash_auto(i)
        state.update(encode_int64(piece_hash))

    return decode_int64(state.digest())


def key_cmp(obj: Tuple[AimObjectKey, AimObject]):
    """Comparator for `(key, value)` pairs w.r.t. their hashes.
    This defines an (meaningless) order but ensures a deterministic one.
    """
    key, _ = obj
    return hash_auto(key)


def hash_object(obj: AimObjectDict) -> int:
    """Hash an dict-like object.

    The implementation does not take into account the order
    `hash({'a': 5, 'b': 7}) == hash({'b': 7, 'a': 5})`
    """
    state = hashlib.blake2b(digest_size=_HASH_SIZE,
                            salt=_HASH_OBJECT_SALT)
    # Here we use `key_cmp` to run over the object keys in an (meaningless but)
    # deterministic order.
    for key_val_tuple in sorted(obj.items(), key=key_cmp):
        # We accumulate the hash state with `(key, value)`, more specificially
        # the array-hash of `(key, value)`
        piece_hash = hash_array(key_val_tuple)
        state.update(encode_int64(piece_hash))

    return decode_int64(state.digest())


def hash_auto(obj: AimObject) -> int:
    """Automatically detect and hash any AimObject-compatible object.

    The hash is an signed 64-bit integer.
    """
    if obj is None:
        return hash_none()
    elif isinstance(obj, bool):
        return hash_bool(obj)
    elif isinstance(obj, int):
        # We use same hash function for all the numbers
        return hash_number(obj)
    elif isinstance(obj, float):
        # We use same hash function for all the numbers
        return hash_number(obj)
    elif isinstance(obj, bytes):
        return hash_bytes(obj)
    elif isinstance(obj, str):
        return hash_string(obj)
    elif isinstance(obj, (tuple, list)):
        # Both `tuple` and `list` types are hashed through `hash_array`
        return hash_array(obj)
    elif isinstance(obj, dict):
        return hash_object(obj)
    else:
        raise NotImplementedError
