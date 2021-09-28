## Aim in 3 steps

You only need these three steps to get started with Aim

1. Install Aim v3.x

```shell
pip install aim>=3.0.0
```

2. Simple integration with your training code

```python
from aim import Run

# Initialize new run
r = Run()

# Log run parameters
r["params"] = {
    "bar": 1,
    "baz": 2,
}

# Log metrics
for i in range(1000):
    r.track(i, name="metric_name")


```

3. Start up the aim UI to observe the run

```shell
aim up

```
