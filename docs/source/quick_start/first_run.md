## Tracking your first run

1. Create Run stored in current directory

```python
from aim import Run

run = Run()
```

2. Log parameters

```python
run['hparams'] = {
    'learning_rate': 0.001,
    'batch_size': 32,
}
```

3. Track metrics

```python
for epoch in range(num_epochs):
    for step, sample in enumerate(train_loader):
        # ...
        run.track(loss_val, name='loss', step=step, epoch=epoch, context={ "subset": "train" })
        run.track(acc_val, name='acc', step=step, epoch=epoch, context={ "subset": "train" })
        # ...
```

Congratulations! Your first run is ready!

Query tracked metadata

1. Create a repo instance

```python
from aim import Repo

# Read .aim repo located at the current working directory
repo = Repo(".")
```

2. Query logged metrics and params

```python
query = "metric.name == \"loss\""

# Get collection of metrics and runs
for run_metrics_collection in repo.query_metrics(query).iter_runs():
    for metric in run_metrics_collection:
        # Get all params
        params = metric.run[...]
        # Get metric values
        steps, metric_values = metric.values.sparse_numpy()
```
