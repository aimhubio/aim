## Getting started

You only need a few steps to get started with Aim.

### Installation

Install Aim via pip3:

```shell
pip3 install aim
```

.. note::
   You need to have python3 and pip3 installed in your environment before installing Aim.

### Integrate with your code

1. Create [Run](./SDK_basics.html#create-a-run) stored in the current directory:

```python
from aim import Run

run = Run()
```

2. Log parameters:

```python
run['hparams'] = {
    'learning_rate': 0.001,
    'batch_size': 32,
}
```

3. Track metrics:

```python
for i in range(10):
    run.track(i, name='loss', step=i, context={ "subset":"train" })
    run.track(i, name='acc', step=i, context={ "subset":"train" })
```

More details/examples [here](./SDK_basics.html#track-params-and-metrics-with-run).

Congrats! Your first run is ready!

### Run Aim UI

Start up the Aim UI to observe the run:

```shell
aim up
```

See more details in [UI basics](./UI_basics.html).

### Query metadata via SDK

```python
from aim import Repo

# Read .aim repo located at the current working directory
repo = Repo('.')

# Get collection of metrics
for run_metrics_collection in repo.query_metrics("metric.name == 'loss'").iter_runs():
    for metric in run_metrics_collection:
        # Get run params
        params = metric.run[...]
        # Get metric values
        steps, metric_values = metric.values.sparse_numpy()
```

See more details in [SDK basics](./SDK_basics.html).
