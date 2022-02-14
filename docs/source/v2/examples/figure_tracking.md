## Figure tracking with Aim

Aim provides a Figure object which can be used to track [plotly](https://plotly.com/python/)
and [matplotlib](https://matplotlib.org/stable/index.html) figures.

To get started, first import the `Figure` object into your code.

```python
from aim import Figure
```

You should pass
either [Plotly Figure](https://plotly.com/python-api-reference/generated/plotly.graph_objects.Figure.html#id0)
or [matplotlib Figure](https://matplotlib.org/stable/api/figure_api.html) as input source to Aim's Figure object.

Here's an example of tracking a plotly figure

```python
import plotly.express as px
from aim import Run, Figure

# Initialize a new run
run = Run()

# First we create Plotly figure
fig = px.bar(x=["a", "b", "c"], y=[1, 3, 2])

# Now we convert it to Aim Figure
aim_figure = Figure(fig)

run.track(aim_figure, name="Plotly Figure", step=0)
```

It is also easy to track `matplotlib` figure. Please note that the conversion process is done by Plotly under the hood.

```python
from aim import Run, Figure
import matplotlib.pyplot as plt

# Initialize a new run
run = Run()

# define matplotlib figure
fig = plt.figure()
plt.plot([1, 2, 3])
plt.close(fig)

# Now we convert it to Aim Figure using (Plotly's functions)
aim_figure = Figure(fig)

run.track(aim_figure, name="matplotlib Figure", step=0)
```
