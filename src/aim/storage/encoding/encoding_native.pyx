# distutils: language = c++
# cython: wraparound = False
# cython: boundscheck = False
# cython: cdivision=True
# cython: nonecheck=False

from aim.storage.encoding.encoding_native cimport *


cpdef inline bytes encode_int64_big_endian(int64 value):
    """Decode an 64-bit signed integer from a buffer
    encoded in big-endian
    """
    cdef char* buffer = [
        (value >> 56) & 0xff,
        (value >> 48) & 0xff,
        (value >> 40) & 0xff,
        (value >> 32) & 0xff,
        (value >> 24) & 0xff,
        (value >> 16) & 0xff,
        (value >> 8) & 0xff,
        (value >> 0) & 0xff
    ]
    return <bytes>buffer[:8]


cpdef inline bytes encode_int64(int64 value):
    """Encode an 64-bit signed integer into a buffer"""
    return (<unsigned char*>(&value))[:8]


cpdef inline int64 decode_int64_big_endian(const unsigned char* buf, int offset = 0) nogil:
    """Decode an 64-bit signed integer from a buffer
    encoded in big-endian
    """
    return (
        ((<int64>buf[0 + offset]) << 56) |
        ((<int64>buf[1 + offset]) << 48) |
        ((<int64>buf[2 + offset]) << 40) |
        ((<int64>buf[3 + offset]) << 32) |
        ((<int64>buf[4 + offset]) << 24) |
        ((<int64>buf[5 + offset]) << 16) |
        ((<int64>buf[6 + offset]) << 8) |
        ((<int64>buf[7 + offset]) << 0)
    )


cpdef inline int64 decode_int64(const unsigned char* buffer, int offset = 0) nogil:
    """Decode an 64-bit signed integer from a buffer"""
    return (<int64*>(buffer + offset))[0]


cpdef inline vector[pair[int64, int64]] split_path(
    const unsigned char* buffer,
    int64 length
) nogil:
    """Split the encoded path in order to decode into string and integer keys.
    The main goal of this functions is to quickly split the encoded path into
    smaller chunks in advance so the keys may be easily decoded.

    Args:
        buffer: binary-encoded path, e.g. for the path `('foo', 19, 'α-γ')`
                the encoded path is:
                `b'foo\\xfe\\xfe\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x13\\xfe\\xce\\xb1-\\xce\\xb3\\xfe'`
        length: the length of buffer

    Returns:
        An array of pairs denoting a key; If the key is integer then the value
        is encoded in `(value, 0)` otherwise the pair `(start, end)` denotes
        starting and ending offsets of key occurring in the provided buffer.
        For example, the result for the sample buffer will be:
          `[(0, 3),   # the segment from 0...3
            (19, 0),  # integer with value 19
            (14, 17)  # the segment 14...17
           ]`
    """
    cdef vector[pair[int64, int64]] path
    cdef int64 start = 0
    cdef int64 cursor = 0
    # We use `tmp_pair` to create a pair before pushing it into vector of chunks
    cdef pair[int64, int64] tmp_pair

    # Here we run over the buffer to detect the boundaries of key encodings.
    # The strategy is as follows:
    #  *  As we detect a new segment, we try to extend the boundary to right
    #     as long as it does not reach the path sentinel / separator symbol.
    #  *  When the cursor has reached a path separator, we store the resulting
    #     segment and forward the cursor right.
    #  *  If we detect a zero-length segment => we reached double-sentinel
    #     notation of integer keys in the path. In that case we decode an
    #     integer, store it in `(value, 0)` pair and forward the cursor right.
    while cursor < length:
        if buffer[cursor] != PATH_SENTINEL_CODE:
            # The current segment is `(start, cursor)` so extend it +1 to right
            cursor += 1
            continue

        if start < cursor:
            # The segment encodes a string key.
            # Store the segment boundaries
            tmp_pair.first = start
            tmp_pair.second = cursor
            path.push_back(tmp_pair)
        else:
            # The segment encodes a integer key
            # Store the integer in `(value, 0)` pair
            tmp_pair.first = decode_int64_big_endian(buffer + cursor + 1)
            tmp_pair.second = 0
            path.push_back(tmp_pair)
            # Move forward 1 byte over the integer key start sentinel,
            # then another 8 bytes for the 64-bit integer key
            cursor += 1 + 8

        # Making a new segment starting right after the path sentinel
        cursor += 1
        start = cursor

    return path


cpdef inline list decode_path(bytes buffer):
    """Decode the binary-encoded path from the given buffer.

    Args:
        buffer: binary-encoded path, e.g.
                `b'foo\\xfe\\xfe\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x13\\xfe\\xce\\xb1-\\xce\\xb3\\xfe'`

    Returns:
        The decoded path as a list of keys of type string or integer.
        For example, the corresponding path for the sample buffer will be:
        `['foo', 19, 'α-γ']`
    """
    cdef list path = []
    cdef vector[pair[int64, int64]] segments = split_path(buffer, len(buffer))
    for item in segments:
        if item.second == 0:
            # In this case the pair only encodes a single integer
            path.append(item.first)
        else:
            # The pair denotes start and end offsets of the string key
            # in the buffer encoded in utf-8
            path.append(buffer[item.first:item.second].decode('utf-8'))
    return path


cpdef inline bytes encode_double(double value):
    """Encode an double precision floating-point number into a buffer"""
    return (<unsigned char*>(&value))[:8]


cpdef inline double decode_double(const unsigned char* bytes, int offset = 0) nogil:
    """Decode an double precision floating-point number from a buffer"""
    return (<double*> (bytes + offset))[0]


cpdef inline bytes encode_utf_8_str(str value):
    """Encode an string into a buffer in utf-8"""
    return value.encode('utf-8')

cpdef inline str decode_utf_8_str(bytes buffer):
    """Decode an string from a buffer encoded in utf-8"""
    return buffer.decode('utf-8')
