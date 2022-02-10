## Quick start

This section describes a simple end-to-end aim setup flow, starting from installation up to running Aim UI and exploring
results. It can be used as a starting point to get familiar with aim interfaces and concepts.

### Installing Aim
Aim package is available for Linux and MacOS for Python versions 3.6+.
Installing aim is really easy using pip:

```shell
$ pip3 install aim
```

Verify aim was properly installed

```shell
$ aim version
```

You should see the line listing newly installed version of Aim:
```shell
Aim v3.5.1
```


The installed package includes Python SDK needed for tracking experiments, Web app for browsing the results and CLI
for managing the app and results.


### Initializing Aim repository
Aim repository is a centralized place where all training experiments metadata should be logged.
To initialize `aim` repo in current working directory run:
```shell
$ aim init
```

Initialized a new Aim repository at /home/user/aim```

Your workspace is now ready for tracking metadata with aim.

### Tracking data with Aim SDK

In order to start tracking results, first you need to create aim `Run` object:
```python
from aim import Run
run = Run()
```

Run provides a dictionary-like interface for storing experiment hyperparameters:
```python
hparams_dict = {}
run['hparams'] = hparams_dict
```

These params can be used later in the UI to query runs, metrics, images.
To track metrics with aim use the `Run.track` method:
```python
run.track(3.0, name='loss')
```
The complete list
of supported inputs is available in section "What data can be tracked with Aim?"
<span style="background:lightyellow">TODO: add link to appropiate page</span>

Here's a full example demonstrating steps above:
```python
# aim_test.py
from aim import Run

run = Run()

# set training hyperparameters
run['hparams'] = {
    'learning_rate': 0.001,
    'batch_size': 32,
}

# log metric
for i in range(10):
    run.track(i, name='numbers')
```

Run the script above
```shell
$ python3 aim_test.py
```

Congrats! Your first run with Aim is ready!
Now it is time to explore results with Aim UI.

### Browsing results with Aim UI
Once the script above finishes you can open Aim UI and see the results:
```shell
$ aim up
```
You should see the following output meaning Aim Web server is up and running:
```shell
Running Aim UI on repo `<Repo#-5930451821203570655 path=/.aim read_only=None>`
Open http://127.0.0.1:43800
Press Ctrl+C to exit
```

Open your browser and navigate to https://localhost:43800
You should be able to see the home page of Aim UI:

<span style="background:lightyellow">TODO: add Aim screenshot/GIF</span>

Click on Metric Explorer icon

<span style="background:lightyellow">TODO: add Aim screenshot</span>

In the Search bar select a "numbers" metric and click "Search".
You should be able to see the tracked values chart:

<span style="background:lightyellow">TODO: add Aim screenshot</span>

### Next steps
This section explained a basics of how to use Aim SDK and gave a quick tour over Aim UI basics.
In the following pages we will cover  
There are many features built in Aim allowing to explore and make sense of large volumes of runs metadata.
If you are interested in exploring Aim functionality, navigate to [User guides](<TODO link here>) section. Detailed API descriptions
available at [References](<TODO link here>). You can browse real-life Aim use-cases in [Examples](<TODO link here>) section.
