# distutils: language = c++
# cython: language_level = 3

cimport aimrocks.lib_rocksdb as interfaces

cdef class ArrayFlagType:
    pass

cdef class ObjectFlagType:
    pass

cdef class CustomObjectFlagType:
    cdef:
        public str aim_name

cdef class BLOB:
    cdef:
        object data
        object loader_fn
    cpdef object load(self)
    # TODO closures inside cython functions are not supported yet
    # cpdef object transform(self, object transform_fn)
