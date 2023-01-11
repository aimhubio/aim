## Track media and objects

Aim supports variety of data sources. Basic logging of `Run` params covers Python builtin types (such as `int`, `float`
, `bool`, `bytes` and `str`) as well as composition of those into dictionaries, lists, tuples at any depth.

In addition to the builtin types, Aim provides native support for
[OmegaConf](https://github.com/omry/omegaconf/blob/master/README.md) configs, thus simplifying integration for projects
running with [Hydra](https://hydra.cc/docs/intro/).

Starting from `v3.6.0` Aim provides integration with [activeloop/hub](https://docs.activeloop.ai/)
datasets. Hub is the open-source dataset format for AI.

Tracking of data includes metrics, images, audio, text and chart figures. Here's the complete list of Aim objects
provided by the package:

- Metrics
- [Distribution](#distribution-tracking-with-aim)
- [Image](#image-tracking-with-aim)
- [Audio](#audio-tracking-with-aim)
- [Text](#text-tracking-with-aim)
- [Figure](#figure-tracking-with-aim)

### Tracking multiple values
Starting from `v3.14.0` Aim provides ability to track multiple values at once. To track multiple values of different 
sequences of the same context, just pass a dictionary of `<name: value>` pairs to the track method:

```python
aim_run.track({'accuracy': 98.2, 'loss': 0.001}, context={'subset': 'train'}, step=10, epoch=1)
```

>  Note: The `name` argument should be set to `None` in this case.

**More examples**

The following code snippet

```shell
from aim import Run

aim_run = Run()

metrics = {'accuracy': 0.72, 'f1': 0.99}
for metric, val in metrics.items()
  aim_run.track(val, name=metric, context={'subset': 'train'})
```

can be simplified to:

```shell
from aim import Run

aim_run = Run()

aim_run.track({'accuracy': 0.72, 'f1': 0.99}, context={'subset': 'train'})
```


### Distribution tracking with Aim

You can store distribution objects in Aim repository using our `aim.Distribution` object.

```python
from aim import Distribution
```

`aim.Distribution` accepts the following parameters

* `distribution`: array-like object used to construct `aim.Distribution`.
* `bin_count`: Optional distribution bin count. 64 by default, max 512.

Your data is converted to `numpy.histogram` upon initialization of the object.

Simple example of initializing and tracking distribution

```python
import random
from aim import Run, Distribution

run = Run()
d = Distribution(
    distribution=[random.randrange(0, 10000) for _ in range(1000)],
    bin_count=250
)
run.track(d, name='dist', step=0)
```

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

    run.track(aim_image, name='images', step=step)
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

    run.track(aim_audio, name='audios', step=step)
```

### Text tracking with Aim

Aim lets your track text/string during your training process.

To get started, first import the `Text` object into your code.

```python
from aim import Text
```

In order to use the `Text` object, you just need to ensure that your input data type is a string.

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
    run.track(aim_text, name='text', step=step)
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

run.track(aim_figure, name="plotly_figures", step=0)
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

run.track(aim_figure, name="matplotlib_figures", step=0)
```

### Tracking matplotlib figures with Aim

In order to track `matplotlib` figures with Aim, either pass the `matplotlib` figure to Aim's `Image` or `Figure`
object.

#### Converting matplotlib to Aim Image

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
run.track(aim_img, step=0, name="matplotlib_images")
```

#### Converting matplotlib to Aim Figure

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
run.track(aim_figure, step=0, name="matplotlib_figures")
```

### Logging activeloop/hub dataset info with Aim

Aim provides wrapper object for `hub.dataset`. It allows to store the dataset info as a `Run`
parameter and retrieve it later just as any other `Run` param. Here is an example of using Aim to log dataset info:

```python
import hub

from aim.sdk.objects.plugins.hub_dataset import HubDataset
from aim.sdk import Run

# create dataset object
ds = hub.dataset('hub://activeloop/cifar100-test')

# log dataset metadata
run = Run(system_tracking_interval=None)
run['hub_ds'] = HubDataset(ds)
```

### Log DVC metadata with Aim

If you are using [DVC](https://dvc.org/) to version your datasets or track checkpoints / other large chunks of data, you
can use Aim to record the info about the tracked files and datasets on Aim. This will allow to easily connect your
datasets info to the tracked experiments. Here is how the code looks like

```python
from aim.sdk import Run
from aim.sdk.objects.plugins.dvc_metadata import DvcData

run = Run(system_tracking_interval=None)

path_to_dvc_repo = '.'
run['dvc_info'] = DvcData(path_to_dvc_repo)
```

If we consider the following [sample repo](https://github.com/iterative/example-get-started) provided by DVC team:

Run the following command to list repository contents, including files and directories tracked by DVC and by Git.

```shell
$ git clone https://github.com/iterative/example-get-started
$ cd example-get-started
$ dvc list .
.dvcignore
.github
.gitignore
README.md
data
dvc.lock
dvc.yaml
model.pkl
params.yaml
prc.json
roc.json
scores.json
src
```

If we apply our previous code snippet on the same repo - we can observe the same information added to Run parameters.

```python
{
    'dvc_info.dataset.source': 'dvc',
    'dvc_info.dataset.tracked_files': [
        '.dvcignore', '.github', '.gitignore',
        'README.md', 'data', 'dvc.lock',
        'dvc.yaml', 'model.pkl', 'params.yaml',
        'prc.json', 'roc.json', 'scores.json', 'src'
    ]
}
```

### Logging huggingface/datasets dataset info with Aim

Aim provides wrapper object for `datasets`. It allows to store the dataset info as a `Run`
parameter and retrieve it later just as any other `Run` param. Here is an example of using Aim to log dataset info:

```python
from datasets import load_dataset

from aim import Run
from aim.hf_dataset import HFDataset

# create dataset object
dataset = load_dataset('rotten_tomatoes')

# store dataset metadata
run = Run()
run['datasets_info'] = HFDataset(dataset)
```