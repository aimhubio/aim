# distutils: language = c++
# cython: language_level = 3

cimport cython

from aim.storage.treeview cimport TreeView
from aim.storage.container cimport Container
from aim.storage cimport treeutils

from aim.storage cimport encoding as E
from aim.storage.encoding.encoding cimport decode
from aim.storage.container cimport Container

from typing import Any, Iterator, Tuple, Union

from aim.storage.treeview import TreeView


cdef class ContainerTreeView(TreeView):
    cdef public Container container
