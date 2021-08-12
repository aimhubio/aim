# distutils: language = c++
# cython: wraparound = False
# cython: boundscheck = False
# cython: cdivision=True
# cython: nonecheck=False

import cython
from libcpp.vector cimport vector
from libcpp.pair cimport pair

import struct

print('6')

# @cython.locals(N=cython.int, i=cython.int, start=cython.int)
#@cython.returns(bytes)
# cdef (int, unsigned char[:])[:] split_path(const unsigned char[:] buffer)

ctypedef long long ll

cdef inline ll q(
    const unsigned char* b
) nogil:
    return (
        ((<ll>b[0]) << 56) |
        ((<ll>b[1]) << 48) |
        ((<ll>b[2]) << 40) |
        ((<ll>b[3]) << 32) |
        ((<ll>b[4]) << 24) |
        ((<ll>b[5]) << 16) |
        ((<ll>b[6]) << 8) |
        ((<ll>b[7]) << 0)
    )


#@cython.wraparound(False)
#@cython.boundscheck(False)
@cython.exceptval(check=False)
cdef inline vector[pair[ll, ll]] split_path(const unsigned char* buffer, ll N) nogil:
    # cdef int N = len(buffer)
    cdef vector[pair[ll, ll]] path
    cdef ll start = 0
    cdef ll i = 0
    cdef ll v
    cdef pair[ll, ll] p
    while i < N:
        if buffer[i] != 254:
            i += 1
            continue

        if start < i:
            # str_key = buffer[start:i]  # .decode('utf-8')
            p.first = start
            p.second = i
            path.push_back(p)
            start = i + 1
            i += 1
            continue
            # path.append(str_key)

        # int_key, = struct.unpack('>q', buffer[i + 1: i + 9])
        v = q(buffer + i + 1)
        # v = i + 1
        p.first = v
        p.second = 0
        path.push_back(p)
        i += 10
        start = i
        # path.append(int_key)

    return path


#@cython.wraparound(False)
#@cython.boundscheck(False)
cpdef inline decode_path(buffer):
    path = []
    cdef vector[pair[ll, ll]] p = split_path(buffer, len(buffer))
    # cdef ll s
    # cdef ll i
    for si in p:
        if si.second > 0:
            path.append(buffer[si.first:si.second].decode('utf-8'))
        else:
            path.append(si.first)
    return path

cpdef inline bytes encode_int(long long value):
    return value.to_bytes(8, byteorder="little", signed=True)


@cython.boundscheck(False)
@cython.wraparound(False)
cpdef inline long decode_int(unsigned char* buffer) nogil:
    return (
        ((<long long>buffer[0]) <<  0) |
        ((<long long>buffer[1]) <<  8) |
        ((<long long>buffer[2]) << 16) |
        ((<long long>buffer[3]) << 24) |
        ((<long long>buffer[4]) << 32) |
        ((<long long>buffer[5]) << 40) |
        ((<long long>buffer[6]) << 48) |
        ((<long long>buffer[7]) << 56)
    )

# Handling `float`

_struct_float = struct.Struct('d')

@cython.exceptval(check=False)
cpdef inline bytes encode_float(double value):
    # TODO handle numpy scalars maybe?
    return _struct_float.pack(value)

cpdef inline double decode_float(unsigned char* bytes) nogil:
    return (<double*> bytes)[0]

cpdef inline bytes encode_str(str value):
    return value.encode('utf-8')

cpdef inline str decode_str(bytes buffer):
    return buffer.decode('utf-8')
