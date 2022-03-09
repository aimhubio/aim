## Concepts

All the functionality in Aim is build around several key concepts. This chapter will give a brief overview of these core
concepts. For more details please check the [Reference](../refs/sdk.html) section or [Glossary](./glossary.html).

### Aim Run

Run is an abstraction representing the tracked data for a single experiment. Its in memory model is SDK class `aim.Run`.
It is a core class used in your training script for tracing metrics and objects, as well as storing training hyperparams
and other data. Run object are queryable and UI provides a rich functionality for exploring runs and browsing single run
details.

### Aim Repo

While you do multiple training experiments, multiple runs data stored in a single directory
called Aim repository (repo for short). You can think of aim repo as an application centralized database.
SDK provides an in memory model for repo `aim.Repo` class. It is responsible for repository resources management and
might be used to query and/or iterate over the stored data.

### Run Params

Each run has a set of parameters associating with it. This might include the training script hyperparameters,
dataset information, etc. The Run object provides dictionary-like interface to set and access run params. Run parameters
are also available in the context of queries. You can set the whole configuration at once with the syntax like this:
```python
run['hparams'] = conf
```
At this moment `Run` supports setting configuration from Python dictionaries and `OmegaConf` configs.
Support of popular configuration formats constantly added. You can check the full list in
[Supported Data types](../quick_start/supported_types.html) section.


### Run Sequence

The sequence is a set of homogeneous ordered objects. In aim sequence must be bound to the Run object. When the value
is tracked in aim, it is appended to an existing or newly created Sequence object. The entire sequences can be queried
using aim QL and each sequence can be sliced further down. Sequence object is agnostic to the element type it holds. The way how
the sequence represented in UI, and the set of additional operations it might have depends on the element type. For example
Metric is a sequence of scalars. It can be represented as a value chart in UI, and SDK provides methods to convert it to
`numpy.ndarray`.

### Sequence Context

The sequence context provides a mechanism to query/group multiple sequences beyond simple string comparison on sequence name.
Sequences with the same name but with different context can perfectly coexist in the scope of one Run. In other words,
sequence defined by its Run, name and context. The example usage of this is tracking the same metric 'loss' for different stages
of training (train, validation, test). The resulting Run will have 3 metrics:
1) `'loss' {'subset': 'train'}`
2) `'loss' {'subset': 'val'}`
3) `'loss' {'subset': 'test'}`
Here is a small code example demonstrating how to specify context for a metric sequence:
   
```python
from aim import Run

aim_run = Run()
for i in range(100):
    if i % 2 == 0:
        aim_run.track(i, name=r'numbers', context={'odds': True})
    else:
        aim_run.track(i, name=r'numbers', context={'odds': False})
```
