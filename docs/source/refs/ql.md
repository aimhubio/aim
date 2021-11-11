## Query Language

Aim QL is a super simple, python-like search that enables rich search capabilities to search experiments.

### Searching runs

`run` instance

| Fields | Description |
| --- | --- |
| `name` | Run name |
| `hasname` | Run hash |
| `experiment` | Run experiment name |
| `tags` | List of run tags |
| `archived` | `True` if run is archived, otherwise `False` |
| `creation_time` | Run creation timestamp |
| `end_time` | Run end timestamp |

Examples:

- `run.name == "my-favorite-run"`
- `run.learning_rate > 0.0001 and "best-model" in run.tags.names`

### Searching metrics

`metric` instance

| Fields | Description |
| --- | --- |
| `name` | Metric name |
| `context` | Metric context dictionary |

Examples:

- `metric.name == "loss"`
- `metric.name == "loss" and metric.context.subset == "train"`
- `metric.name == "loss" and metric.context.subset == "train" and run.name == "my-favorite-run"`
- `run.hparams.dataset == "few_cb" and not metric.context.is_training and run.hparams.num_epochs < 100`
