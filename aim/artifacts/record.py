from typing import List, Any, Tuple, Optional


class Record:
    def __init__(self, cat: Tuple[str], name: str = None, content: Any = None,
                 is_singular: bool = False, data: Any = None,
                 binary_type: Optional[str] = None, context: dict = None):
        self.name = name
        self.cat = cat
        self.content = content
        self.is_singular = is_singular
        self.data = data
        self.binary_type = binary_type
        self.context = context


class RecordCollection:
    def __init__(self, name: str, cat: str, records: List[Record] = None,
                 is_singular: bool = False, data: Any = None):
        self.name = name
        self.cat = cat
        self.records = records if records is not None else []
        self.is_singular = is_singular
        self.data = data

    def append_record(self, record: Record):
        self.records = self.records or []
        self.records.append(record)
