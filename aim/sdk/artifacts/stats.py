from typing import Any
from abc import ABCMeta

from aim.sdk.artifacts.serializable import Serializable


class Stats(Serializable, metaclass=ABCMeta):
    cat = ('stats',)

    def __init__(self, name: str, stats: Any):
        self.name = name
        self.stats = stats

        super(Stats, self).__init__(self.cat)

    def __str__(self):
        return self.name

    def serialize(self) -> dict:
        serialized = {
            self.DIR: {
                'name': self.name,
                'cat': self.cat[0],
                'files': [],
                'data': {
                    'stats': [],
                },
            },
        }

        transposed_stats = {}
        for stat_key, stat_value in self.stats.items():
            for resource_key, resource_usage in stat_value.items():
                transposed_stats.setdefault(resource_key, {})
                transposed_stats[resource_key][stat_key] = resource_usage

        for resource_key, resource_usage in transposed_stats.items():
            serialized_item = self.serialize_item(resource_key, resource_usage)
            serialized[self.DIR]['files'].append(serialized_item)
            serialized[self.DIR]['data']['stats'].append(resource_key)

        return serialized

    def serialize_item(self, file_name, content):
        serialized = {
            self.LOG_FILE: {
                'name': file_name,
                'cat': self.cat,
                'content': content,
                'mode': self.CONTENT_MODE_APPEND,
            },
        }

        return serialized
