import datetime
import json

from typing import TYPE_CHECKING, Tuple, Union

from aim.sdk.sequence import Sequence
from aim.storage import treeutils


if TYPE_CHECKING:
    from pandas import DataFrame


class Metric(Sequence):
    """Class representing series of numeric values."""

    @classmethod
    def allowed_dtypes(cls) -> Union[str, Tuple[str, ...]]:
        # TODO remove 'float64': temporary fix for repos generated with aim < 3.0.7
        return 'float', 'float64', 'int', 'number'

    @classmethod
    def sequence_name(cls) -> str:
        return 'metric'

    def dataframe(
        self,
        include_name: bool = False,
        include_context: bool = False,
        include_run: bool = False,
        only_last: bool = False,
    ) -> 'DataFrame':
        """Get metric series as pandas DataFrame

        Args:
             include_name: (:obj:`int`, optional): If true, include metric name in dataframe. False by default.
             include_context: (:obj:`int`, optional): If true, include metric context
                path:value pairs in dataframe. False by default.
             include_run: (:obj:`int`, optional): If true, include run run.hash and run hparams
                path:value pairs in dataframe. False by default.
             only_last: (:obj:`int`, optional): If true return dataframe for only last value, step, timestamp
                and epoch. False by default.
        """
        # Returns dataframe with rows corresponding to iters
        # Columns: `step`, `value`, `time`
        # steps = list(self.steps)
        self.preload()

        if only_last:
            last_step, last_value = self.values.last()
            steps = [last_step] if self.version == 1 else [self.data.steps[last_step]]
            values = [last_value]
            epochs = [self.epochs[last_step]]
            timestamps = [self.timestamps[last_step]]
        else:
            try:
                steps, (values, epochs, timestamps) = self.data.items_list()
            except ValueError:
                steps = []
                values = []
                epochs = []
                timestamps = []
        indices = [i for i, _ in enumerate(steps)]
        timestamps = [datetime.datetime.fromtimestamp(t) for t in timestamps]
        data = {'idx': indices, 'step': steps, 'value': values, 'epoch': epochs, 'time': timestamps}

        if include_run:
            data['run.hash'] = [self.run.hash] * len(indices)
            for path, val in treeutils.unfold_tree(self.run[...], unfold_array=False, depth=3):
                s = 'run'
                for key in path:
                    if isinstance(key, str):
                        s += f'.{key}'
                    else:
                        s += f'[{key}]'

                if isinstance(val, (tuple, list, dict)):
                    val = json.dumps(val)
                data[s] = [val for _ in indices]
        if include_name:
            data['metric.name'] = [self.name for _ in indices]
        if include_context:
            for path, val in treeutils.unfold_tree(self.context.to_dict(), unfold_array=False, depth=3):
                s = 'metric.context'
                for key in path:
                    if isinstance(key, str):
                        s += f'.{key}'
                    else:
                        s += f'[{key}]'
                # path = '.'.join(path)
                if isinstance(val, (tuple, list)):
                    val = json.dumps(val)
                # df[s] = val
                data[s] = [val for _ in indices]

        import pandas as pd

        df = pd.DataFrame(data)
        return df
