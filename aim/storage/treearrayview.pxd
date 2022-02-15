# distutils: language = c++
# cython: language_level = 3

from aim.storage.arrayview cimport ArrayView
from aim.storage.treeview cimport TreeView

cdef class TreeArrayView(ArrayView):
    cdef:
        public TreeView tree
        public object dtype
