# distutils: language = c++
# cython: language_level = 3

from aim._core.storage cimport utils
from aim._core.storage.utils cimport interfaces

cdef class ContainerItemsIterator(interfaces.Iterator):
    pass

cdef class Container:
    cdef __weakref__

    cpdef void close(self)
    cpdef void preload(self)
    cpdef object get(self, bytes key, object default = *)
    cpdef void set(self, bytes key, object value, store_batch = *)
    cpdef void delete_range(self, bytes begin, bytes end, store_batch = *)

    cpdef ContainerItemsIterator items(self, bytes begin = *, bytes end = *)

    cpdef bytes next_key(self, bytes key = *)
    cpdef object next_value(self, bytes key = *)
    cpdef tuple next_key_value(self, bytes key = *)
    cpdef tuple next_item(self, bytes key = *)
    cpdef bytes prev_key(self, bytes key = *)
    cpdef object prev_value(self, bytes key = *)
    cpdef tuple prev_key_value(self, bytes key = *)
    cpdef tuple prev_item(self, bytes key = *)
