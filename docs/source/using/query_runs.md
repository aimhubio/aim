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

Besides querying `Run`s and metrics, you can also query logged `Image` objects:

```python
query = "images.name == 'mnist_dataset' and images.context.subset == 'val"

# Get collection of Image sequences
for image_seq in my_repo.query_images(query).iter():
    # Get first tracked batch of each sequence
    image_batch = image_seq.values.first_value()
    # Get Image metadata
    image_meta = map(Image.json, image_batch)
    # Convert to PILImage
    pil_images = map(Image.to_pil_image, image_batch)
```

`Image` class full [spec](../refs/sdk.html#aim.sdk.objects.image.Image).


See more advanced usage examples [here](https://colab.research.google.com/drive/14rIAjpEyklf5fSMiRbyZs6iYG7IVibcI).
