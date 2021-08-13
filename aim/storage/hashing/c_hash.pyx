# distutils: language = c++

from aim.storage.hashing cimport c_hash

cpdef Py_hash_t det_hash(double v):
    return c_hash.le_Py_HashDouble(v)
