# distutils: language = c++
# cython: wraparound = False
# cython: boundscheck = False
# cython: cdivision=True
# cython: nonecheck=False

import cython
from libcpp.vector cimport vector
from libcpp.pair cimport pair

import struct

ctypedef long long ll

cdef ll q(const unsigned char* b) nogil
cdef vector[pair[ll, ll]] split_path(const unsigned char* buffer, ll N) nogil
cpdef decode_path(bytes buffer)
cpdef bytes encode_int(long long value)
cpdef long decode_int(const unsigned char* buffer) nogil
cpdef bytes encode_float(double value)
cpdef double decode_float(const unsigned char* bytes) nogil

cpdef bytes encode_str(str value)
cpdef str decode_str(bytes buffer)
