## AIM Image object

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
