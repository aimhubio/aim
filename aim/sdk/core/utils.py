import uuid
import datetime

import pytz


def generate_hash(hash_length=24) -> str:
    return uuid.uuid4().hex[:hash_length]


def utc_timestamp():
    return datetime.datetime.now(pytz.utc).timestamp()
