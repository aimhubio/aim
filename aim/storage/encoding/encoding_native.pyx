# distutils: language = c++
# cython: wraparound = False
# cython: boundscheck = False
# cython: cdivision=True
# cython: nonecheck=False

import cython

from aim.storage.encoding.encoding_native cimport *

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



cdef inline vector[pair[ll, ll]] split_path(const unsigned char* buffer, ll N) nogil:
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
            p.first = start
            p.second = i
            path.push_back(p)
            start = i + 1
            i += 1
            continue

        v = q(buffer + i + 1)

        p.first = v
        p.second = 0
        path.push_back(p)
        i += 10
        start = i

    return path



cpdef inline decode_path(bytes buffer):
    path = []
    cdef vector[pair[ll, ll]] p = split_path(buffer, len(buffer))
    for si in p:
        if si.second > 0:
            path.append(buffer[si.first:si.second].decode('utf-8'))
        else:
            path.append(si.first)
    return path

cpdef inline bytes encode_int(long long value):
    return (<unsigned char*>(&value))[:8]

cpdef inline long decode_int(const unsigned char* buffer) nogil:
    return (<long long*>buffer)[0]


cpdef inline bytes encode_float(double value):
    return (<unsigned char*>(&value))[:8]

cpdef inline double decode_float(const unsigned char* bytes) nogil:
    return (<double*> bytes)[0]

cpdef inline bytes encode_str(str value):
    return value.encode('utf-8')

cpdef inline str decode_str(bytes buffer):
    return buffer.decode('utf-8')
