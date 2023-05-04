# distutils: language = c++
# cython: language_level = 3

from aim.core.storage.arrayview cimport ArrayView
from aim.core.storage.treeview cimport TreeView

cdef class TreeArrayView(ArrayView):
    cdef:
        public TreeView tree
        public object dtype
