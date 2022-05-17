## Manage runs

### Create runs

`Run` is the main object that tracks and stores ML training metadata(e.g. metrics or hyperparams).

When initializing a `Run` object, Aim creates a `.aim` repository at the specified path.
The tracked data is stored in the `.aim` repo.
If the repo path is not specified, the run data is stored in the current working directory.

Use the following `Run` arguments to:
 - `repo`: define where to store the data
 - `experiment`: define experiment name to group related runs together
 - `system_tracking_interval`: Enable system resource usage tracking (CPU, GPU, memory, etc..). By default enabled. Set to `None` to disable
 - `capture_terminal_logs`: Enable process output capturing. By default enabled. Set to `False` to disable.

```python
from aim import Run

my_run = Run(
    repo='/repo/path/to/store/runs',
    experiment='experiment_name'
)
```
`Run` class full [spec](../refs/sdk.html#aim.sdk.run.Run).

Additionally, Aim SDK also gives a flexibility to:
- Use multiple `Run`s in one training script to store multiple runs at once. Usually handy when doing hyperparameter search.
- Use integrations to automate tracking

### Continue runs

Each Run object has a `hash` associated with it which could be looked up at `aim runs ls` (check out the [Aim CLI](../refs/cli.html#runs) here).
Specify the run hash when initializing a `Run` object to continue tracking.

```python
from aim import Run

run = Run(run_hash='run_hash')
```

### Delete runs

There are cases when `Run` data is not needed. Examples of such cases are, 
failed training runs or simple disk space cleanup. Aim provides SDK and CLI interfaces
to delete `Run`s.

To remove `Run`s via the SDK:

```python
from aim import Repo

repo = Repo.from_path('aim_repo_path')
repo.delete_run('run_hash')
repo.delete_runs(['run_hash_1', 'run_hash_2'])
```

`Repo` class full [spec](../refs/sdk.html#aim.sdk.repo.Repo).


To remove `Run`s using command line:
```shell
aim runs rm run_hash_1 run_hash_2 run_hash_3
```

More details on `aim runs` in CLI [reference](../refs/cli.html#runs).
