## Configure runs

You can configure Aim run instance to change the default repository location, retrieve a particular run instance, or
store custom parameters for your run. You can configure your Run upon instantiation.

Here you can see all available options you can use to configure your Run instance.

- `run_hash`: Run's hash. Can be used to restore/retrieve a particular run form the repo. This is handy if you want to
  update something or add new metrics in your already existing run. If skipped, the hash will be generated
  automatically. Example covered in [Reusing Run in your Repo](#reusing-run-in-your-repo) section.

- `repo`: Aim repository path or Repo object to which Run object is bound. If skipped, default Repo is used. More
  covered in [Defining custom location for your Repo](#defining-custom-location-for-your-repo) section.

- `read_only`: Run creation mode. Default is False, meaning Run object can be used to track metrics.

- `experiment`: Sets Run's `experiment` property. 'default' if not specified. Can be used later to query runs/sequences.

- `system_tracking_interval`: Sets the tracking interval in seconds for system usage metrics (CPU, Memory, etc.). Set
  to `None` to disable system metrics tracking.

- `log_system_params`: Enable/Disable logging of system params such as installed packages, git info, environment
  variables, etc. Checkout [Training Run Reproducibility](#training-run-reproducibility) section for more info.

### Reusing Run in your Repo

Sometimes you might want to add/update parameters and tracked values in your existing Run instance. This can be achieved
trough using `run_hash` parameter. Aim generates a unique id (uuid) for your Run instance only if `run_hash` parameter
is not supplied. Example of re-using generated run.

```python
from aim import Run

# You can also use ID shown in Aim Web after 
# creating a run without supplying run_hash parameter
uid = '508c5b29-02c7-4875-a157-f099ea193bfa'
run = Run(run_hash=uid)
for i in range(100):
    run.track(i, step=i, name='test')
```

In the example above, no matter how often this piece of code will be executed, only a single run entry will be created
or updated.

### Defining custom location for your Repo

When you use aim, the library automatically creates `.aim` directory which we call "Repo" in your current directory. Aim
stores data about your runs inside the Repo. Sometimes creating a Repo in your current directory is not convenient due
to various reasons (like lack of permissions), and in such scenarios you can define your own path where a new `.aim`
directory will be created or just reused.

```python
from aim import Run

run = Run(repo="~/repo")
...
```

The code above will create a new dir entry `~/repo/.aim`

### Training Run Reproducibility

When running multiple training jobs it is crucial to understand the factors affecting the trained models performance.
While the hyperparameters diff is an obvious place to look at, the training script environment itself can change the
collected metadata in unexpected ways. It is important to be able to reproduce your runs’ environment to presumably get
the same results. Sometimes even minor version change in your script dependencies or a small tweak in the training code
itself can affect training results. Thus, it's important to collect and log information such as package versions,
environment variables, input arguments, etc. with each run.

Doing this manually requires a lot of code to be added to your training script. This is where Aim's logging of system
parameters can come in handy!

#### What data is logged automatically?

Aim lets you enable system params logging for your Run which in result will log the following parameters

- Environment Variables
- Executables
- CLI arguments
- Installed packages and their versions
- Git information such as current branch, commit hash, author, etc. (if applicable)

#### How to enable system params automatic logging?

To enable logging of the parameters listed above, your Run instance must be supplied with
`log_system_params=True` option, by default it is disabled!

```python
run = Run(log_system_params=True)
```

In addition, these logged parameters can be used in the search box to filter runs based on the supplied parameters.
Everything is searchable at Aim!

Here is an example of what you can do with it:

```python
run.__system_params.git_info.branch == 'feature/testing'
```
