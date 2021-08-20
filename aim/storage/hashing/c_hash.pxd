from cpython.object cimport PyObject
cdef extern from "hash/hash.h":
    cdef Py_hash_t le_Py_HashDouble(
        double v
    );
