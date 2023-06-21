# distutils: language = c++
# cython: language_level=3
# distutils: language_level = 3

from aim._core.storage.hashing cimport c_hash

cpdef Py_hash_t det_hash(double v):
    """Custom hashing function for numeric values.
    Heavily based on CPython implementation with few details.

    Similar CPython, we expect `hash(x) == hash(y)` if `x == y`
    even if one of them is `int` and other one is `float`.
    This is achieved be mapping any floating-point number to a integer such that
    if the number encodes integer value it maps to itself with one exception:
      *  CPython uses a reserved hash value of `-1` for errors. So they map both
         integer `-1` and float `-1.0` to hash value `-2`.
    This is not a big issue when using them for hashmaps / hashsets but it
    introduces to frequent collisions.
    For example, even when CPython's PYTHONHASHSEED is used, it is easy to
    verify that: `hash((-1, -3)) == hash((-2, -3))`. When mapping `-1` to `-2`
    is avoided, hash seeds can really make a huge difference.
    """
    return c_hash.le_Py_HashDouble(v)
