# distutils: language = c++
# cython: language_level = 3

# We define a mapping for primitive types into a single bit
# The types are going to be stored in a single byte, so 7 more bits are reserved
cdef enum FLAGS:
    _NONE = 0
    _BOOL = 1
    _INT = 2
    _FLOAT = 3
    _STRING = 4
    _BYTES = 5
    _ARRAY = 6
    _OBJECT = 7
    _CUSTOM_OBJECT = 8 | 7


cpdef object encode(object value)

cpdef object decode(object buffer)

cpdef bytes encode_key(object key)

cpdef bytes encode_path(object path)
