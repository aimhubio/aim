# distutils: language = c++
# cython: language_level = 3

cdef extern from "hash/hash.h":
    cdef Py_hash_t le_Py_HashDouble(
        double v
    );
