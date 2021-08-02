# distutils: language = c++
# cython: wraparound = False
# cython: boundscheck = False

import cython
from libcpp.vector cimport vector
from libcpp.pair cimport pair

# @cython.locals(N=cython.int, i=cython.int, start=cython.int)
#@cython.returns(bytes)
# cdef (int, unsigned char[:])[:] split_path(const unsigned char[:] buffer)

ctypedef long long ll

cdef inline ll q(
    ll b0,
    ll b1,
    ll b2,
    ll b3,
    ll b4,
    ll b5,
    ll b6,
    ll b7
) nogil:
    return (
        (b0 << 56) |
        (b1 << 48) |
        (b2 << 40) |
        (b3 << 32) |
        (b4 << 24) |
        (b5 << 16) |
        (b6 << 8) |
        (b7 << 0)
    )


#@cython.wraparound(False)
#@cython.boundscheck(False)
@cython.exceptval(check=False)
cdef vector[pair[ll, ll]] split_path(const unsigned char[:] buffer, ll N) nogil:
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
        v = q(buffer[i + 1 + 0], buffer[i + 1 + 1], buffer[i + 1 + 2], buffer[i + 1 + 3],
              buffer[i + 1 + 4], buffer[i + 1 + 5], buffer[i + 1 + 6], buffer[i + 1 + 7])
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
cpdef decode_path(buffer):
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
