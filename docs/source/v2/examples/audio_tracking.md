## AIM Audio object

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
