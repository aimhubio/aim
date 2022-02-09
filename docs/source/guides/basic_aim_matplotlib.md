### Tracking matplotlib figures in Aim

In this guide, we will show you how to track `matplotlib` figures in Aim.

This can be accomplished by either passing matplotlib figure to Aim's `Image` or `Figure` object.

### Converting matplotlib to Aim Image

```python
from aim import Run, Image
import matplotlib.pyplot as plt

run = Run()

# define matplotlib figure
fig = plt.figure()
plt.plot([1, 2, 3])
plt.close(fig)

# pass it to aim Image
aim_img = Image(fig)
run.track(aim_img, step=0, name="matplotlib Image")
```

### Converting matplotlib to Aim Figure

Please note that the conversion process is done by [Plotly](https://plotly.com/python/) under the hood.

```python
from aim import Run, Figure
import matplotlib.pyplot as plt

run = Run()

# define matplotlib figure
fig = plt.figure()
plt.plot([1, 2, 3])
plt.close(fig)

aim_figure = Figure(fig)
run.track(aim_figure, step=0, name="matplotlib Figure")
```
