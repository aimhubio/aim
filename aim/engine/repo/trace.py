from typing import Dict, Any, Union, Optional, Tuple


class Trace(object):
    def __init__(self, repo, metric, name: str, context: Optional[list] = None):
        self.repo = repo
        self.metric = metric
        self.name = name
        self.data = []
        self._num_records = None
        self.context = None  # type: Optional[Dict[str, Union[str, Any]]]
        self.hashable_context = None
        if context is not None:
            self.context = {
                k: v for (k, v) in context
            }
            self.hashable_context = tuple(sorted(self.context.items()))

    def __repr__(self):
        return str(self.context)

    def __len__(self):
        return self.num_records

    @property
    def num_records(self):
        if self._num_records is not None:
            return self._num_records

        try:
            storage = self.metric.get_storage()
            self._num_records = storage.get_records_num(self.name, self.context)
        except:
            self._num_records = 0
        return self._num_records

    def read_records(self, indices: Optional[Union[int, Tuple[int, ...],
                                                   slice]] = None):
        storage = self.metric.get_storage()
        records_iter = storage.read_records(self.name, indices,
                                            self.context)
        return records_iter

    def append(self, data_item):
        self.data.append(data_item)

    def to_dict(self):
        return {
            'context': self.context,
            'num_steps': self.num_records,
            'data': self.data,
        }
