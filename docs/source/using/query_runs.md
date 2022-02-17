### Query runs and objects

Use `Repo` object to query and access saved `Run`s.

Initialize a `Repo` instance:

```python
from aim import Repo

my_repo = Repo('/path/to/aim/repo')
```
`Repo` class full [spec](../refs/sdk.html#aim.sdk.repo.Repo).

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
See more advanced usage examples [here](https://colab.research.google.com/drive/14rIAjpEyklf5fSMiRbyZs6iYG7IVibcI).
