## Manage runs

### Create runs

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

### Continue runs

Specify the run hash when initializing a `Run` object to continue tracking.

```python
from aim import Run

run = Run(run_hash='run_hash')
```

### Delete runs

[TODO]
