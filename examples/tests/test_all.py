import random
import os
import numpy as np
import plotly.express as px

import aim


def gen_batch(shape, t):
    res = []

    def gen_str(length):
        import string
        return str(''.join(random.choices(string.ascii_uppercase+string.digits,
                                          k=length)))

    if t is aim.Audio:
        for _ in range(shape):
            for _, fl in enumerate(os.listdir('sounds')):
                audio_fl_name, extension = fl.split('.')
                audio_fl_path = os.path.join('sounds', fl)
                audio = aim.Audio(audio_fl_path, format=extension, caption=audio_fl_name)
                res.append(audio)
        return res

    for _ in range(shape):
        if t is aim.Image:
            res.append(aim.Image(np.ones((100, 100, 3), dtype=np.uint8), format='jpeg', optimize=True))
        elif t is aim.Text:
            res.append(aim.Text(gen_str(100)))

    return res


# Create a new run
run = aim.Run(repo='remote://127.0.0.1:10033')

# Set run params
run['params'] = {
    'foo': 1,
    'bar': [2, 3, 'string'],
    'baz': {
        'nested': 1,
        'arr': ['foo', 'bar', 'baz'],
    },
}

for i in range(20):
    # Track metrics
    run.track(random.randint(0, 10), name='metric', context={'subset': 'foo'})
    run.track(random.randint(0, 10), name='metric', context={'subset': 'bar'})

    # Track images
    run.track(gen_batch(16, aim.Image), name='images')

    # Track audios
    run.track(gen_batch(16, aim.Audio), name='audios')

    # Track texts
    run.track(gen_batch(16, aim.Text), name='texts')

    # Track distributions
    run.track(aim.Distribution(np.random.rand(100)), name='distributions')

    # Track plotly figures
    df = px.data.iris()
    fig = px.scatter(df, x="sepal_width", y="sepal_length", color="species",
                     size='petal_length', hover_data=['petal_width'])
    run.track(aim.Figure(fig), name='figures')
