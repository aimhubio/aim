# distutils: language = c++
# cython: language_level = 3

cdef class ArrayView:
    """Array of homogeneous elements with sparse indices.
    Interface for working with array as a non-sparse array is available for cases
    when index values are not important.
    """
    pass
