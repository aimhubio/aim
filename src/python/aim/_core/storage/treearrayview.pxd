# distutils: language = c++
# cython: language_level = 3

from aim._core.storage.arrayview cimport ArrayView
from aim._core.storage.treeview cimport TreeView

cdef class TreeArrayView(ArrayView):
    cdef:
        public TreeView tree
        public object dtype
