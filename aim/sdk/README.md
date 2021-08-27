## Overview

Aim SDK package provides easy way to log training metadata across multiple runs, and fast intuitive Query Language for accessing saved data.

## Quick Start

### Prerequisites
1. Make sure aim `3.0.0` or upper installed:
   
```shell
pip install aim>=3.0.0
```

2. Initialize aim repository:
   
```shell
aim init
```

#### Create your first run and track some values

```python
from aim.sdk.run import Run

run = Run()  # create Run with default repository
run['params'] = {'foo': 'bar'}  # set Run meta-params for 

for i in range(100):
    run.track(i, step=i, name='ordinals', context={})
    run.track(-i, step=i, name='negative integers', context={})
    if i % 2 == 0:
        run.track(i, step=i, name='ordinals', context={'odds': True})

```
Congratulations! Your first run is ready!

#### Query metric series
```python
from aim.sdk.repo import Repo

repo = Repo.default_repo()  # get default repository instance

q = '''
metric.run.params.foo == 'bar' and metric = 'ordinals' and context['odds'] = True
'''

traces = repo.traces(query=q)  # query metric traces
for trc in traces:
    odd_ordinals = trc.values.values_list()  # return tracked values as list
    ...  # do your stuff
```
You can find more examples of `Aim SDK` [here][getting_started_examples].

## Aim SDK API reference
Aim SDK package defines classes for manipulating Aim repository, creating Runs and tracking metrics, 
as well as querying run results across the entire repository. It includes the following classes and modules:

---
<kbd>class</kbd> [`aim.sdk.Repo`](#sdk.Repo) is an interface for entire Aim repository. 
Provides APIs for querying and iterating repository Runs/Traces.

---
<kbd>class</kbd> [`aim.sdk.Run`](#sdk.Run) provides interface for working with single Run. 
Usually `Run` objects used directly for tracking metrics and setting meta-parameters.

---
<kbd>module</kbd> `aim.sdk.adapters`
provides callback implementations for integrating with the following ML libraries:

[`tensorflow`](#adapters.tensorflow)
[`keras`](#adapters.keras)
[`pytorch`](#adapters.pytorch)
[`xgboost`](#adapters.xgboost)
[`huggingface`](#adapters.huggingface)

---
<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/legacy/__init__.py"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

<kbd>module</kbd> `aim.sdk.legacy`
contains classes and methods for the sake of backwards compatibility.
It is highly recommended convert your existing scripts and do not use this module since it will be dropped in future releases.
---


[getting_started_examples]: https://github.com/aimhubio/aim/tree/main/examples

<a name="sdk.Repo"></a>
## `aim.sdk.repo.Repo`
<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/repo.py#L28"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

### <kbd>class</kbd> `Repo`
Aim repository object. Provides methods for  repositories creation/opening/cleanup. Provides APIs for accessing Runs. Provides API for querying Runs/Traces based on a given expression. 

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/repo.py#L38"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> `__init__`

```python
__init__(path: str, read_only: bool = None, init: bool = False)
```

Create new Repo object. 

**Args:**
 
 - <b>`path`</b> (`str`):  Path to Aim repository. 
 - <b>`read_only`</b> (`bool`, optional):  Flag for opening Repo in readonly mode. Repo is writable by default. 
 - <b>`init`</b> (`bool`, optional):  Flag used to initialize new Repo. Recommended to se `aim init` command instead. 




---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/repo.py#L246"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> collect_metrics

```python
collect_metrics() → Dict[str, list]
```

Utility function for getting metrics and contexts for all traces. 

**Returns:**
 
 - <b>``dict``</b>:  tree of metrics and their contexts. 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/repo.py#L261"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> collect_params

```python
collect_params()
```

Utility function for getting run meta-parameters. 

**Returns:**
 
 - <b>``dict``</b>:  All runs meta-parameters. 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/repo.py#L81"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>classmethod</kbd> default_repo

```python
default_repo(init: bool = False)
```

Named constructor for default repository. Searches nearest `.aim` directory from current directory to roo directory. If not found, return Repo for current directory. 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/repo.py#L110"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>classmethod</kbd> exists

```python
exists(path: str) → bool
```

Check repo exists. 

**Args:**
 
 - <b>`path`</b> (`str`):  repository path. 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/repo.py#L97"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>classmethod</kbd> from_path

```python
from_path(path: str, read_only: bool = None, init: bool = False)
```

Named constructor for Repo for given path. Args: as for `__init__`. 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/repo.py#L195"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> get_run

```python
get_run(hashname: str) → Union[ForwardRef('Run'), NoneType]
```

Get run if exists. 

**Args:**
 
 - <b>`hashname`</b> (`str`):  Run hashname. 

**Returns:**
 
 - <b>`Run/None`</b>:  Run object if hashname is found in repository. None otherwise. 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/repo.py#L185"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> iter_runs

```python
iter_runs() → Iterator[ForwardRef('Run')]
```

Iterate over Repo runs Yields: next `Run` in readonly mode 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/repo.py#L235"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> iter_traces

```python
iter_traces(query: str = '') → QueryTraceCollection
```

Alias for traces() 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/repo.py#L208"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> query_runs

```python
query_runs(query: str = '') → QueryRunTraceCollection
```

Get runs satisfying query expression. 

**Args:**
 
 - <b>`query`</b> (`str`):  query expression. 

**Returns:**
 
 - <b>`QueryRunTraceCollection`</b>:  Iterable for runs/traces matching given query. 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/repo.py#L121"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>classmethod</kbd> rm

```python
rm(path: str)
```

Remove aim Repo. Used to re-initialize repository. 

**Args:**
 
 - <b>`path`</b> (`str`):  repository path. 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/repo.py#L221"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> traces

```python
traces(query: str = '') → QueryTraceCollection
```

Get runs satisfying query expression. 

**Args:**
 
 - <b>`query`</b> (`str`):  query expression. 

**Returns:**
 
 - <b>`QueryTraceCollection`</b>:  Iterable for traces matching given query for all runs. 


<a name="sdk.Run"></a>
## `aim.sdk.run.Run`
<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/run.py#L31"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

### <kbd>class</kbd> Run
Run object used for tracking metrics. Provides method `track` to track value series [traces] for multiple metrics and contexts. Provides dictionary-like interface for Run object meta-parameters. Provides API for iterating tracked traces. 

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/run.py#L42"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> `__init__`

```python
__init__(
    hashname: Optional[str] = None,
    repo: Optional[str, ForwardRef('Repo')] = None,
    read_only: bool = False,
    experiment: Optional[str] = None,
    system_tracking_interval: int = 1`0
)
```

Create Run object. 

**Args:**
 
 - <b>`hashname`</b> (`str`, optional):  Run's hashname. If skipped, generated automatically. 
 - <b>`repo`</b> (optional):  Aim repository path or Repo object to which Run object is bound.  If skipped, default Repo is used. 
 - <b>`read_only`</b> (`bool`, optional):  Run creation mode. Default is False, meaning Run object can be used to track metrics. 
 - <b>`experiment`</b> (`str`, optional):  Sets Run's `experiment` property if specified.  Can be used later to query runs/traces. 
 - <b>`system_tracking_interval`</b> (`int`, optional):  Sets the tracking interval in seconds for system usage  metrics (CPU, Memory, etc.). Set to `None` to disable system metrics tracking. 


---

#### <kbd>property</kbd> creation_time

Run object creation time. 

---

#### <kbd>property</kbd> props

Access to predefined structured data. Includes `name`, `experiment`, `tags`, `creation_time`

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/run.py#L151"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> get

```python
get(key, default: Any = None, strict: bool = True)
```

Get run meta-parameter by key if exists, default otherwise. 

**Args:**
 
 - <b>`key`</b>:  path to Run meta-parameter. 
 - <b>`default`</b>:  default value. 

**Examples:**
 run = Run() run.get('hparams', {}) run.get(('hparams', 'batch_size'), '') 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/run.py#L297"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> get_trace

```python
get_trace(
    metric_name: str,
    context: Context
) → Union[ForwardRef('Trace'), NoneType]
```

Retrieve metric trace by it's name and context. 

**Args:**
 
 - <b>`metric_name`</b> (`str`):  Tracked metric name. 
 - <b>`context`</b> (`dict`, optional):  Tracked metric context. 

**Returns:**
 
 - <b>``Trace/None``</b>:  Tracked metric trace if exists None otherwise. 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/run.py#L313"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> get_traces_overview

```python
get_traces_overview() → list
```

Retrieve Run traces general overview. 

**Returns:**
 
 - <b>``list``</b>:  list of trace `context`, `metric_name` and last tracked values. 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/run.py#L266"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> iter_all_traces

```python
iter_all_traces() → Iterator[Tuple[str, Context, ForwardRef('Run')]]
```

Iterator for all run traces. Yields: Next pair of metric, context + Run object itself. 

**Examples:**
  run = Run()  for metric, cxt, _ in run.iter_all_traces():  print(metric) 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/run.py#L283"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> traces

```python
traces() → TraceCollection
```

Get iterable object for all run tracked traces. 

**Returns:**
 
 - <b>``TraceCollection``</b>:  Iterable for run traces. 

**Examples:**
 run = Run() for trc in run.traces():  trc.values.sparse_numpy() 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/run.py#L188"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> track

```python
track(
    value,
    name: str,
    step: int = None,
    epoch: int = None,
    context: Union[NoneType, bool, int, float, str, bytes, List[ForwardRef('AimObject')], Tuple[ForwardRef('AimObject'), ], Dict[Union[int, str], ForwardRef('AimObject')]] = None
)
```

Main method for tracking numeric value series 

**Args:**
 
 - <b>`value`</b>:  The tracked value. 
 - <b>`name`</b> (`str`):  Tracked metric name. 
 - <b>`step`</b> (`int`, optional):  The iteration step. 
 - <b>`epoch`</b> (`int`, optional):  The training epoch. 
 - <b>`context`</b> (`dict`, optional):  Tracked metric context. 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/run.py#L140"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> `__getitem__`

```python
__getitem__(key)
```

Get run meta-parameter by key. 

**Args:**
 
 - <b>`key`</b>:  path to Run meta-parameter. 

**Examples:**
 run = Run() run['hparams'] run['hparams', 'batch_size'] 

---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/run.py#L131"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> `__setitem__`

```python
__setitem__(key: str, val: Any)
```

Set Run top-level meta-parameter. 

**Args:**
 
 - <b>`key`</b> (`str`):  top-level meta-parameter name. 
 - <b>`val`</b>:  meta-parameter value. 


---

<a href="https://github.com/aimhubio/aim/blob/main/aim/sdk/run.py#L180"><img align="right" style="float:right;" src="https://img.shields.io/badge/-source-cccccc?style=flat-square"></a>

#### <kbd>method</kbd> `__delitem__`

```python
__delitem__(key: str)
```

Remove key from run meta-params. 

**Args:**
 
 - <b>`key`</b> (`str`):  top-level meta-parameter name. 

---
<a name="adapters.tensorflow"></a>
<a name="adapters.keras"></a>
<a name="adapters.pytorch"></a>
<a name="adapters.xgboost"></a>
<a name="adapters.huggingface"></a>

### Legacy SDK support
Aim `3.0.0` supports legacy APIs for backwards compatibility. 
Please note these APIs will be dropped in the future.
Mode details on legacy APIs can be found [here](#legacy).

<a name="legacy"></a>