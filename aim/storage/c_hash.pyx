# distutils: language = c++

cimport c_hash

cpdef Py_hash_t det_hash(v):
    return c_hash.le_Py_HashDouble(v, v)
