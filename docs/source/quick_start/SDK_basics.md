## SDK Basics

### Creating a new Run

`Run` is the main object that tracks and stores the ML training metadata (e.g. metrics or hyperparams).

When initializing a `Run` object, Aim creates the `.aim` repository at the specified path.
Tracked data is stored in `.aim` repo.
If the path is not specified, the data is stored in the current working directory.

Use `Run` arguments to:
 - Define where to store the data;
 - Define experiment name to group related runs together;
 - Enable system resource usage tracking (CPU, GPU, memory, etc..).

Example:

```python
from aim import Run

my_run = Run(
    repo='/repo/path/to/store/runs', # Repo path to store my_run data
    experiment='experiment_name',    # Experiment name to group related runs together
)
```
[TODO] link to Run specs

Additionally, Aim SDK also gives a flexibility to:
- Reopen and continue finished `Run`s;
- Use multiple `Run`s in one training script to store multiple runs at once;
- Use integrations to automate tracking.

### Tracking parameters and metrics

It is quite simple to track ML metadata with `Run`.

`Run` provides simple and intuitive interface for:
 - Tracking the metrics of your training run;
 - Logging the parameters of your training run;

**Parameters**

Track nearly any python dictionary:
[TODO] link to specs
```python

# Log training hyper-parameters
my_run['hparams'] = {
    'learning_rate': 0.0001,
    'batch_size': 32,
}
```

**Metrics**

Use `track` method to log ML metrics like 'loss', 'accuracy' or 'bleu'.
```python
# Track metrics
for step in range(1000):
    value = step * 10
    my_run.track(
        value,       # Current value to track
        name='loss', # The metric name
        step=step,   # Step index (optional)
        epoch=0,     # Epoch (optional)
        context={    # Metric context (optional)
            'subset': 'train',
        },
    )

```
[TODO] link to track specs

### Querying runs and tracked metadata

Use `Repo` object to query and access logged `Run`s.

Initialize a `Repo` instance:

```python
from aim import Repo

my_repo = Repo('/path/to/aim/repo')
```
[TODO] link to Repo specs

Query logged metrics and parameters:

```python
query = "metric.name == 'loss'" # Example query

# Get collection of metrics
for run_metrics_collection in my_repo.query_metrics(query).iter_runs():
    for metric in run_metrics_collection:
        # Get run params
        params = metric.run[...]
        # Get metric values
        steps, metric_values = metric.values.sparse_numpy()
```
[TODO] link to shared colab
