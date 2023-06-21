#include "Python.h"


#ifdef __cplusplus
    extern "C" {
#endif


// the code is brought from the CPython sources

Py_hash_t
le_Py_HashDouble(
    double v
) {
    int e, sign;
    double m;
    Py_uhash_t x, y;

    if (!Py_IS_FINITE(v)) {
        if (Py_IS_INFINITY(v))
            return v > 0 ? _PyHASH_INF : -_PyHASH_INF;
        else
            return 0; // _Py_HashPointer(inst); // TODO remove  => implement __eq__ for AimObject
    }

    m = frexp(v, &e);

    sign = 1;
    if (m < 0) {
        sign = -1;
        m = -m;
    }

    /* process 28 bits at a time;  this should work well both for binary
       and hexadecimal floating point. */
    x = 0;
    while (m) {
        x = ((x << 28) & _PyHASH_MODULUS) | x >> (_PyHASH_BITS - 28);
        m *= 268435456.0;  /* 2**28 */
        e -= 28;
        y = (Py_uhash_t)m;  /* pull out integer part */
        m -= (double)y;
        x += y;
        if (x >= _PyHASH_MODULUS)
            x -= _PyHASH_MODULUS;
    }

    /* adjust for the exponent;  first reduce it modulo _PyHASH_BITS */
    e = e >= 0 ? e % _PyHASH_BITS : _PyHASH_BITS-1-((-1-e) % _PyHASH_BITS);
    x = ((x << e) & _PyHASH_MODULUS) | x >> (_PyHASH_BITS - e);

    x = x * sign;

//  in contrast to the original implementation, we do not set -1 for errors
//    if (x == (Py_uhash_t)-1)
//        x = (Py_uhash_t)-2;
    return (Py_hash_t)x;
}



#ifdef __cplusplus
    }
#endif
