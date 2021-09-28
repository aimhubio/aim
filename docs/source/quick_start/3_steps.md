## Aim in 3 steps

1. Make sure aim `3.0.0` or upper installed:

```shell
pip install aim>=3.0.0
```

2. Initialize aim repository:

```python
from aim import Run

# Initialize a new run
r = Run()

# Log run parameters
r["foo"] = {
    "bar": 1,
    "baz": 2,
}

# Log metrics
for i in range(1000):
    r.track(i, name="metric_name")

```

3. Start the aim UI to observe the run

```shell
aim up

```
