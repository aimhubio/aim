## Configure runs 

### Training Run Reproducibility

When running multiple training jobs it is crucial to understand the factors affecting the trained models performance.
While the hyperparameters diff is an obvious place to look at, the training script environment itself can change
the collected metadata in unexpected ways. It is important to be able to reproduce your runs’ environment to presumably
get the same results. Sometimes even minor version change in your script dependencies or a small tweak in the training
code itself can affect training results. Thus, it's important to collect and log information such as package versions,
environment variables, input arguments, etc. with each run.

Doing this manually requires a lot of code to be added to your training script. This is where Aim's logging of system
parameters can come in handy!

### What data is logged automatically?

Aim lets you enable system params logging for your Run which in result will log the following parameters

- Environment Variables
- Executables
- CLI arguments
- Installed packages and their versions
- Git information such as current branch, commit hash, author, etc. (if applicable)

### How to enable system params automatic logging?

To enable logging of the parameters listed above, your Run instance must be supplied with
`log_system_params=True` option, by default it is disabled!

```python
run = Run(log_system_params=True)
```

In addition, these logged parameters can be used in the search box to filter runs based on the supplied
parameters. Everything is searcheable at Aim!

Here is an example of what you can do with it:

```python
run.__system_params.git_info.branch == 'feature/testing'
```
