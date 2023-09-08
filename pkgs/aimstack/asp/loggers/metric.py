import numbers
import json

from typing import Optional, Any

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from pandas import DataFrame

from aim import Sequence


class DataframeMixin:
    def dataframe(
            self,
            include_name: bool = False,
            include_context: bool = False,
            include_axis: bool = True,
            only_last: bool = False
    ) -> 'DataFrame':
        data = {
            'step': [],
            'value': []
        }
        if include_axis:
            data.update({axis: [] for axis in self.axis_names})

        if only_last:
            step = self._info.last_step
            val = self._tree['last_value']
            data['step'].append(step)
            data['value'].append(val)
            if include_axis:
                axis_values = self._tree['axis_last_values'].values()
                for axis in self.axis_names:
                    data[axis].append(axis_values.get(axis))
        else:
            for step, val in self.items():
                data['step'].append(step)
                data['value'].append(val['val'])
                if include_axis:
                    for axis in self.axis_names:
                        data[axis].append(val.get(axis))
        indices = [i for i, _ in enumerate(data['step'])]
        data['idx'] = indices
        if include_name:
            data['metric.name'] = [self.name] * len(indices)
        if include_context:
            from aim._core.storage import treeutils
            for path, val in treeutils.unfold_tree(self.context,
                                                   unfold_array=False,
                                                   depth=3):
                context_key = 'metric.context'
                for key in path:
                    if isinstance(key, str):
                        context_key += f'.{key}'
                    else:
                        context_key += f'[{key}]'
                if isinstance(val, (tuple, list)):
                    val = json.dumps(val)
                data[context_key] = [val] * len(indices)

        import pandas as pd
        df = pd.DataFrame(data)
        return df


class Metric(Sequence[numbers.Number], DataframeMixin):
    def track(self, value: Any, *, step: Optional[int] = None, **axis):
        from aim._sdk import num_utils
        if num_utils.is_number(value):
            value = num_utils.convert_to_py_number(value)
        super().track(value, step=step, **axis)


class SystemMetric(Sequence[numbers.Number], DataframeMixin):
    ...
