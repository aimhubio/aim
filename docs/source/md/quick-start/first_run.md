## Tracking your first run


```python
from aim.sdk.run import Run

run = Run()  # create Run with default repository
run['params'] = {'foo': 'bar'}  # set Run meta-params for

for i in range(100):
    run.track(i, step=i, name='ordinals', context={})
    run.track(-i, step=i, name='negative integers', context={})
    if i % 2 == 0:
        run.track(i, step=i, name='ordinals', context={'odds': True})

```
Congratulations! Your first run is ready!
