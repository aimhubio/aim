### Training Run Reproducibility

Sometimes factors like tensorflow/pytorch version, your current branch, some cli argument, etc. 
can heavily affect your training results, and sometimes you'd wish to be able to reproduce these results. 
This is where Aim's logging of system parameters can come handy!

Aim lets you enable system params logging for your Run which in result will log the following parameters
- Environment Variables
- Executable
- CLI arguments
- Installed packages and their versions
- Git information such as current branch, commit hash, author, etc. (if applicable)

To enable logging of the parameters listed above, your Run instance must be supplied with 
`log_system_params=True` option, by default it is disabled!

```python
run = Run(log_system_params=True)
```

In addition, logging these parameters can be later used in the search box 
to filter runs based on the supplied parameters.

```python
run.__system_params.git_info.branch == 'feature/testing'
```