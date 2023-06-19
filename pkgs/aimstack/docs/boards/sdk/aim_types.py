ui.header('Using Aim SDK Type System')

ui.html("""
    Aim Python SDK provides core building blocks for creating applications which track and visualize metadata.
    Though these core classes are sufficient enough, Aim provides capabilities to exnted it's type system and build
    applications in more convenient manner. 
""")
ui.html("""
    Below are some use-cases of extending Aim core classes.
""")

########################################################################################################################
ui.subheader('Example 1: Extending functionality of Container')
ui.html("""
    The following example demonstrates how to use the extended Container types. First lets define a class Run:
""")
ui.code("""
from aim import Container

class Run(Container):
    @property
    def name(self) -> str:
        return self._attrs_tree['name']

    @name.setter
    def name(self, val: str):
        self['name'] = val

    @property
    def description(self) -> str:
        return self._attrs_tree['description']

    @description.setter
    def description(self, val: str):
        self['description'] = val

    @property
    def archived(self) -> bool:
        return self._attrs_tree['archived']

    @archived.setter
    def archived(self, val: bool):
        self['archived'] = val
""")

ui.html("""
    Now lets query Runs and access it's properties directly from the query results:
""")

ui.code("""
from aim import Repo

repo = Repo.default()

container_info = {c.name: c.description for c in repo.containers("c.archived == False", 'Run')}
""")
ui.html("""
    Note the second argument of the Repo.container() method. Here the type name 'Run' is used to filter containers of
    type 'Run', which also allows to safely access it's name and description properties.
""")

########################################################################################################################
ui.subheader('Example 2: Restricting object types allowed to track on a Sequence')
ui.html("""
    The following example demonstrates how to leverage the Aim Sequence generic type to fix the tracked items type and
    enable extra functionality which is applicable to limited set of values.
    Lets assume we want to define class Metric, which is a sequence of numeric values, and has an additional interface
    to calculate the mean of the tracked values. The base Sequence class allows to track any Aim storage compatible type.
    However, mean value cannot be calculated for such heterogeneous sequences, hence, we need to extend the Sequence class.
""")

ui.code("""
from aim import Sequence
import pandas as pd


class Metric(Sequence[numbers.Number]):
    def dataframe(
            self,
            include_name: bool = False,
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

        df = pd.DataFrame(data)
        return df
""")
ui.html("""
    The magic happens at the following line:
""")
ui.code("""
class Metric(Sequence[numbers.Number]):
""")

ui.html("""
    Note the argument of the Sequence generic type. It fixes the allowed values to be limited to instances of 
    numbers.Number and it's subclasses. It is safe to call Metric.dataframe(), as it's track() method will enforce type
    checking. Trying to track other values, i.e. Image will result to an error:
""")

ui.code("""
from my_package import Run, Metric

m = Metric(run, name='loss', context={})
m.track(1)  # OK
m.track(2.0)  # OK
m.track("text")  # error

""")
