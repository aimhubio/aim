## Configure runs

You can configure Aim run instance to change the default repository location, retrieve a particular run instance, or
store custom parameters for your run. You can configure your Run upon instantiation.

Here you can see all available options you can use to configure your Run instance.

- `run_hash`: Run's hash. Can be used to restore/retrieve a particular run form the repo. This is handy if you want to
  update something or add new metrics in your already existing run. If skipped, the hash will be generated
  automatically. Example covered in [Reusing Run in your Repo](#reusing-run-in-your-repo) section.
  Starting from Aim version `3.13`, run_hash values restricted to the auto-generated values only. This
  is done to prevent multiple undesired cases, such as, creating a new `Run` instead of re-opening
  the existing one due to the typo, putting special symbols in `Run.hash`, etc. If the wrong `run_hash` is
  specified, `MissingRunError` will be raised.

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

run = Run(repo='~/repo')
...
```

The code above will create a new dir entry `~/repo/.aim`

### Organizing Runs in Experiments

Aim allows you to group runs under experiments, which can be useful for comparing runs intended to tackle a particular
task.

```python
from aim import Run

run = Run(experiment="fraud-detection")
```

### Adding tags and params to Run

Aim lets you add tags and parameters on your Run object. Example of this would be if you want to tag your run with a
specific version or keyword. Or you might need to log parameters, so you have some insight on what params have been used
to process that particular Run.

Example of adding and removing tags

```python
from aim import Run

run = Run()
run.add_tag('v1.0')
run.add_tag('some-awesome-tag')
```

Or you can modify tags on your existing run, but first you have to restore Run object by using it's hash value

```python
from aim import Run

uid = '508c5b29-02c7-4875-a157-f099ea193bfa'
run = Run(run_hash=uid)
run.remove_tag('some-awesome-tag')
run.add_tag('another-awesome-tag')
```

Almost same approach goes for parameters

```python
from aim import Run

run = Run()
var = 'some value'

run['var'] = var
```

Also, you can restore the Run object using its hash key and overwrite value of the previously stored parameter.

```python
from aim import Run

uid = '508c5b29-02c7-4875-a157-f099ea193bfa'
run = Run(run_hash=uid)
var = 'another value'

run['var'] = var
```

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

### Capturing Terminal logs

When it comes to automating training of multiple runs with job schedulers or workload managers on a cluster,
it becomes hard to track the terminal logs of the runs. This includes the stdout, stderr from the training nodes too.


Inspecting these terminal logs is important, as it may convey crucial information about the training, for example:
- warnings, alerts and errors about the training process,
- debugging information,
- model training statistics, model architecture or summary.

Aim makes it is easier to analyze the terminal logs in one place by streaming them to Aim UI near-real-time.

Terminal logs are captured by default. In order to disable it, set the `capture_terminal_logs` argument to `False`, when initializing the `Run`:

```python
aim_run = Run(capture_terminal_logs=False)
```

Check out how to view captured logs on Aim UI [here](../ui/pages/run_management.html#id13).
