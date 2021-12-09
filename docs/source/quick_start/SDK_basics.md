## SDK Basics

### Create a Run

`Run` is the main object that tracks and stores ML training metadata(e.g. metrics or hyperparams).

When initializing a `Run` object, Aim creates a `.aim` repository at the specified path.
Tracked data is stored in `.aim` repo.
If the path is not specified, the data is stored in the current working directory.

Use `Run` arguments to:
 - Define where to store the data
 - Define experiment name to group related runs together
 - Enable system resource usage tracking (CPU, GPU, memory, etc..)

```python
from aim import Run

my_run = Run(
    repo='/repo/path/to/store/runs',
    experiment='experiment_name',
)
```
`Run` class full [spec](../refs/sdk.html#aim.sdk.run.Run).

Additionally, Aim SDK also gives a flexibility to:
- Use multiple `Run`s in one training script to store multiple runs at once
- Use integrations to automate tracking

### Continue a Run

Specify the run hash when initializing a `Run` object to continue tracking.

```python
from aim import Run

run = Run(run_hash='run_hash')
```

### Track params and metrics with Run

`Run` provides simple and intuitive interface for:
- Tracking the metrics of your training run
- Logging the parameters of your training run

**Parameters**

Track nearly any python dictionaries:
```python

# Log training hyper-parameters
my_run['hparams'] = {
    'learning_rate': 0.0001,
    'batch_size': 32,
}
```
Supported types of [dictionaries](https://github.com/aimhubio/aim/blob/main/aim/storage/types.py#L19).

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
`Run.track` method full [spec](../refs/sdk.html#aim.sdk.run.Run.track).

### Track images with Run

Track images to explore model inputs, outputs, confusion matrices, weights, etc:

```python
from aim import Image

for step in range(1000):
    my_run.track(
        Image(img_tensor_or_pil, img_caption), # Pass image data and/or caption
        name='generated', # The name of image set
        step=step,   # Step index (optional)
        epoch=0,     # Epoch (optional)
        context={    # Context (optional)
            'subset': 'train',
        },
    )

```
`Image` class full [spec](../refs/sdk.html#module-aim.sdk.objects.image).

Tracking batches of images:

```python
for step, (images, labels) in enumerate(train_loader):
    aim_images = [Image(img, lbl) for img, lbl in zip(images, labels)]

    my_run.track(
        aim_images, # List of images
        name='generated', # The name of image set
        step=step,   # Step index (optional)
        epoch=0,     # Epoch (optional)
        context={    # Context (optional)
            'subset': 'train',
        },
    )
```

Full example [here](https://github.com/aimhubio/aim/blob/main/examples/pytorch_track_images.py).

### Track distributions with Run

Track distributions to explore model gradients, weights, etc.
To store a distribution pass an iterable of scalar values to the `Distribution` object.

```python
from aim import Distribution

for step in range(1000):
    my_run.track(
        Distribution(tensor), # Pass distribution
        name='gradients', # The name of distributions
        step=step,   # Step index (optional)
        epoch=0,     # Epoch (optional)
        context={    # Context (optional)
            'type': 'weights',
        },
    )

```
`Distribution` class full [spec](../refs/sdk.html#module-aim.sdk.objects.distribution).

### Query Runs and saved metadata

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
