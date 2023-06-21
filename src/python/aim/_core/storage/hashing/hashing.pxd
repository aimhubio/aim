# distutils: language = c++
# cython: language_level = 3

"""Hashing implementations of AimObject-compatible data.
This is different from CPython's implementation because of many reasons:
  *  CPython uses non-deterministic hashing to avoid collision attacks.
     Although we also cover such scenarios, in contrast to CPython, we do not
     use PYTHONHASHSEED environment variable.
  *  We implement hash for mutable objects as well (`list`, `dict`, etc.)
  *  Our implementation are less prone to manually designed collisions.
"""

ctypedef long long int64

import hashlib

from aim._core.storage.encoding import encode_int64, decode_int64  # noqa
from aim._core.storage.hashing cimport c_hash

cdef int64 hash_none(object obj = *)
cdef int64 hash_uniform(int64 bad_hash)
cdef int64 hash_number(double number)
cdef int64 hash_bool(bint obj)
cdef int64 hash_bytes(bytes obj)
cdef int64 hash_string(str obj)
cdef int64 hash_array(obj)
cdef int64 key_cmp(tuple obj)
cdef int64 hash_object(obj)
cpdef int64 hash_auto(obj)
