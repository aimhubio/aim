from typing import Iterator
import struct
from sqlalchemy import text as sa_text
from aim.storage.structured.sql_engine.models import Base as StructuredBase
from aim.web.api.db import get_contexted_session
from aim.web.api.dashboards.models import Base as ApiBase


def decode_encoded_tree_stream(stream: Iterator[bytes]) -> bytes:
    # TODO: handle case when chunk ends at the middle of key/value
    # TODO: if remaining part of chunk cannot be unpacked, prepend to next one and try with new chunk
    for chunk in stream:
        data = chunk
        print("processing chunk: ", len(chunk))
        while data:
            (key_size,), data = struct.unpack('I', data[:4]), data[4:]
            key, data = data[:key_size], data[key_size:]

            (value_size,), data = struct.unpack('I', data[:4]), data[4:]
            value, data = data[:value_size], data[value_size:]

            yield key, value


def truncate_structured_db(db):
    session = db.get_session()
    meta = StructuredBase.metadata
    for table in reversed(meta.sorted_tables):
        session.execute(sa_text(f'DELETE FROM {table.name};'))


def truncate_api_db():
    with get_contexted_session() as session:
        meta = ApiBase.metadata
        for table in reversed(meta.sorted_tables):
            session.execute(sa_text(f'DELETE FROM {table.name};'))
            session.commit()
