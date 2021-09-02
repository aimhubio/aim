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

### Creating your first run

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

### Query metric series

```python
from aim.sdk.repo import Repo

repo = Repo.default_repo()  # get default repository instance

q = '''
metric.run.params.foo == 'bar' and metric = 'ordinals' and context['odds'] = True
'''

metrics = repo.query_metrics(query=q)  # query metric traces
for metric in metrics:
    odd_ordinals = metric.values.values_list()  # return tracked values as list
    ...  # do your stuff
```

You can find more examples of `Aim SDK` usage [here][getting_started_examples].

### Aim SDK Query language

Aim SDK allows querying/filtering results using Python-style expressions for runs and metrics. 
There are two different entities available `metric:Metric` and `run:Run`, where `metric` is used for
accessing metric name and context, while `run` is needed for filtering results by run hparams and properties.
Below is the specification of Aim QL along with some examples.

**Aim QL specification**
```
<expr_list> ::= <expr> | <expr_list>, <expr>
<expr> ::= (<expr> and <expr>) | (<expr> or <expr>) | <check>
<check> ::= <function>(<expr_list>) | <check> <binary_op> <check> | <entity_expr>
<function> ::= Python builtin functions
<binary_op> ::= Python builtin binary operators
<entity_expr> ::= <entity>.<attr> | <entity>[<param>] | <entity_expr>.<attr> | <entity_expr>[<param>]
<entity> ::= 'run' | 'metric'
<attr> ::= <identifier>
<param> ::= "<identifier>" | <param>, "<identifier>" | '<identifier>' | <param>, '<identifier>' 
<identifier> ::= <character><identifier> | <character>
<character> ::= <digit> | <letter> | <space>
```

**Aim QL examples**
```python
query = "run['hparams', 'batch_size'] > 30 and metric.name = 'loss' and metric.context['subset'] == 'train'"
query = "run.experiment != 'default' and metric.name = 'loss' and len(run.tags) > 0"
query = "0.001 >= run.hparams.lr >= 0.0001"
```

[getting_started_examples]: https://github.com/aimhubio/aim/tree/main/examples

