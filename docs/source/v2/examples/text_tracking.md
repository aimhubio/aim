## AIM Image object

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
