# distutils: language = c++
# cython: language_level = 3

cdef class TreeView:
    cdef:
        object __weakref__

    cpdef view(self, object path, bint resolve = *)
    cpdef object make_array(self, object path = *)
    cpdef object collect(self, object path = *, bint strict = *, bint resolve_objects = *)
