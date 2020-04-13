from abc import ABCMeta
from typing import Any

from aim.sdk.artifacts.artifact import Artifact
from aim.sdk.artifacts.record import Record, RecordCollection


class Stats(Artifact, metaclass=ABCMeta):
    cat = ('stats',)

    def __init__(self, name: str, stats: Any):
        self.name = name
        self.stats = stats

        super(Stats, self).__init__(self.cat)

    def __str__(self):
        return self.name

    def serialize(self) -> RecordCollection:
        records = []
        stats = []

        transposed_stats = {}
        for stat_key, stat_value in self.stats.items():
            for resource_key, resource_usage in stat_value.items():
                transposed_stats.setdefault(resource_key, {})
                transposed_stats[resource_key][stat_key] = resource_usage

        for resource_key, resource_usage in transposed_stats.items():
            serialized_item = self.serialize_item(resource_key, resource_usage)
            records.append(serialized_item)
            stats.append(resource_key)

        return RecordCollection(
            name=self.name,
            cat=self.cat[0],
            records=records,
            data={'stats': stats},
        )

    def serialize_item(self, file_name, content):
        return Record(
            name=file_name,
            cat=self.cat,
            content=content,
        )

    def save_blobs(self, name: str, abs_path: str = None):
        pass
