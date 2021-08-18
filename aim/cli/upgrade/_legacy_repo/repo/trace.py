from typing import Dict, Any, Union, Optional, Tuple


class Trace(object):
    def __init__(self, repo, metric, name: str, context: Optional[list] = None):
        self.repo = repo
        self.metric = metric
        self.name = name
        self.data = []
        self.tmp_data = {}  # used for storing temporary data for x_axis metric values
        self.current_x_axis_value = None  # used for checking ordering of x_axis metric values
        self.alignment = None  # used for storing alignment flags when x_axis is aligned by custom metric
        self.slice = None
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

    def read_records(self, indices: Optional[Union[int, Tuple[int, ...],
                                                   slice]] = None):
        storage = self.metric.get_storage()
        records_iter = storage.read_records(self.name, indices,
                                            self.context)
        return records_iter
