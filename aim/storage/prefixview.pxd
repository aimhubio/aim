# distutils: language = c++
# cython: language_level = 3
cimport cython

from aim.storage.container cimport Container
from aim.storage.container cimport ContainerItemsIterator
from aim.storage.containertreeview cimport ContainerTreeView

cdef class PrefixView(Container):
    cdef public bytes prefix
    cdef public Container parent
    cdef public bint read_only

    cpdef bytes absolute_path(self, bytes path = *)
    cpdef ContainerTreeView tree(self)

cdef class PrefixViewItemsIterator(ContainerItemsIterator):
    cdef PrefixView prefix_view
    cdef bytes path
    cdef int prefix_len
    cdef ContainerItemsIterator it

    @cython.locals(item=tuple, keys=bytes)
    cdef object next(self)
