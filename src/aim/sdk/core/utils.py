import uuid
import datetime

import pytz


def generate_hash(hash_length=24) -> str:
    return uuid.uuid4().hex[:hash_length]


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(pytz.utc)


def utc_timestamp() -> float:
    return utc_now().timestamp()
