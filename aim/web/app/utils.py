import datetime
import pytz
import math
import os

from flask import send_from_directory


def default_created_at():
    return datetime.datetime.utcnow().replace(tzinfo=pytz.utc)


def normalize_type(val):
    if isinstance(val, str):
        if val == 'True':
            return True
        elif val == 'False':
            return False
        elif val == 'None':
            return None

        try:
            val = int(val)
        except:
            try:
                val = float(val)
            except:
                pass
    return val


def unsupported_float_type(value) -> bool:
    if not isinstance(value, (int, float)):
        return True

    if math.isinf(value):
        return True

    if math.isnan(value):
        return True

    return False

def send_from_directory_gzip_compressed(directory, filename, **options):
    compressed_filename = '{}.gz'.format(filename)
    if os.path.exists(os.path.join(directory, compressed_filename)):
        rv = send_from_directory(directory, compressed_filename, **options)
        rv.headers.add('Content-Encoding', 'gzip')
        return rv

    return send_from_directory(directory, filename, **options)
