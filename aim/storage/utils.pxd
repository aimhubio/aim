# distutils: language = c++
# cython: language_level = 3

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

cdef class ExtBLOB:
    cdef:
        object data
        object loader_fn
        public object ext_path
    cpdef object load(self)
    # cpdef object transform(self, object transform_fn)
