## What data can be tracked with Aim?

Aim supports variety of data sources. Basic logging of `Run` params covers
Python builtin types (such as `int`, `float`, `bool`, `bytes` and `str`) as well as
composition of those into dictionaries, lists, tuples at any depth.
In addition to the builtin types, Aim provides native support for 
[OmegaConf](https://github.com/omry/omegaconf/blob/master/README.md) configs, thus
simplifying integration for projects running with [Hydra](https://hydra.cc/docs/intro/).

Tracking of data includes scalars, images, audio data and chart figures. Here's
the complete list of Aim objects provided by the package:
- Scalars
- [Image](#image-tracking-with-aim)
- [Audio](#audio-tracking-with-aim)
- [Text](#text-tracking-with-aim)
- [Figure](#figure-tracking-with-aim)

### Image tracking with Aim

Aim lets your track an image using `aim.Image` object

To get started, first import the `Image` object into your code.

```python
from aim import Image
```

Our Image object uses [Pillow](https://pillow.readthedocs.io/en/stable/) under the hood. Image object supports the
following inputs as data source.

- Path to an image file
- **PIL** (Pillow object)
- **torch.Tensor** (PyTorch tensor object)
- **tf.Tensor** (TensorFLow tensor object)
- **np.array** (Numpy array object)
- **matplotlib.figure.Figure** (matplotlib figure object)

Here's an example of tracking image from file path

```python
path = "~/test_image.png"
aim_image = Image(path)
```

Image object also has the following arguments:

```text
caption  (:obj: `str`,  optional): Optional image caption. '' by default. 
format   (:obj: `str`,  optional): Parameter for PIL's .save() method. 'png' by default.
quality  (:obj: `int`,  optional): Parameter for PIL's .save() method. 85 by default.
optimize (:obj: `bool`, optional): Parameter for PIL's .save() method. False by default.
```

For more information on the `format`, `quality` and `optimize` parameters, refer
to [Pillow documentation](https://pillow.readthedocs.io/en/stable/reference/Image.html).

Using these parameters you can manipulate image quality and/or convert the image format from `.png` to `jpeg` or to any
other format (which is supported by Pillow)

```python
from aim import Run, Image

# Initialize a new run
run = Run()

for step in range(1000):
    # Log image
    path = f"~/test_image_{step}.png"
    aim_image = Image(
        path,
        format='jpeg',
        optimize=True,
        quality=50
    )

    run.track(aim_image, name='img', step=step)
```

### Audio tracking with Aim

Aim lets your track an audio data using `aim.Audio` object

To get started, first import the `Audio` object into your code.

```python
from aim import Audio
```

You can use `Audio` object to track MP3, WAV and FLAC audio data. Audio object supports the following data as input.

- File path
- Raw bytes
- `io.BytesIO` stream
- Numpy array (only for WAV audio format)

This object comes with the following optional arguments.

```text
format  (:obj:`str`): Format of the audio source. Choices are ('flac', 'mp3', 'wav')
rate    (:obj:`int`): Only for WAV. Rate of the audio file, defaults to 22500
caption (:obj:`str`): Optional audio caption. An empty string by default.
```

Complete example of tracking WAV audio data.

```python
import os.path
from aim import Run, Audio

# Initialize a new run
run = Run()

for step in range(1000):
    # Log image
    path = f"~/test_audio_{step}.mp3"
    aim_audio = Audio(
        path,
        format='mp3',
        caption=os.path.basename(path)
    )

    run.track(aim_audio, name='audio', step=step)
```

### Text tracking with Aim

Aim lets your track text/string during your training process.

To get started, first import the `Test` object into your code.

```python
from aim import Text
```

It is relatively easy to use this object. You just have to ensure that your input data type is a string.

Here's an example of `Text` usage:

```python
import random
import string
from aim import Run, Text

# Initialize a new run
run = Run()

for step in range(100):
    # Generate a random string for this example
    random_str = ''.join(random.choices(
        string.ascii_uppercase +
        string.digits, k=20)
    )
    aim_text = Text(random_str)
    run.track(aim_text, step=step)
```

### Figure tracking with Aim

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
