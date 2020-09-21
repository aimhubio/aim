# Aim

![GitHub Top Language](https://img.shields.io/github/languages/top/aimhubio/aim) [![PyPI Package](https://img.shields.io/pypi/v/aim-cli?color=yellow)](https://pypi.org/project/aim-cli/) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A super-easy way to record, search and compare AI experiments.

<img src="https://user-images.githubusercontent.com/13848158/92605507-ddfacd80-f2c2-11ea-8547-0659ee2dcb37.png">

## Getting started in three steps
1. Install Aim in your training environment and init in the project folder
```shell
$ pip3 install aim-cli
```
2. Import Aim in your training code
```py
import aim
...
aim.set_params(hyperparam_dict, name='params_name')
aim.track(metric_value, name='metric_name', epoch=the_epoch_value)
...
```
3. Run the training like you are used to and start the AI Dev Environment
```shell
$ aim up
```
[Here](http://demo-1.aimstack.io/) is what to expect when you first open Aim.

## Contents

- [Aim](#aim)
  - [Contents](#contents)
  - [Getting Started In Three Steps](#getting-started-in-three-steps)
  - [Installation](#installation)
  - [Concepts](#concepts)
  - [Where is the Data Stored](#where-is-the-data-stored)
  - [Python Library](#python-library)
    - [aim.track()](#track)
    - [aim.set_params()](#set_params)
    - [aim.Session()](#session)
  - [Automatic Tracking](#automatic-tracking)
    - [TensorFlow and Keras](#tensorflow-and-keras)
  - [Searching Experiments](#searching-experiments)
    - [Search Examples](#search-examples)
  - [Command Line Interface](#command-line-interface)
    - [init](#init)
    - [version](#version)
    - [experiment](#experiment)
    - [de](#de)
    - [up](#up)
    - [down](#down)
  - [TensorBoard Experiments](#tensorboard-experiments)
  - [How It Works](#how-it-works)
  - [Contributor Guide](https://github.com/aimhubio/aim/wiki/Contributing)

## Installation
To install Aim, you need to have python3 and pip3 installed in your environment
1. Install Aim python package
```shell
$ pip3 install aim-cli
```
In order to start Aim Development Environment you need to have Docker installed.
```shell
$ aim up
```

## Concepts
- **Run** - A single training run 
- **Experiment** - a group of associated training runs

## Where is the Data Stored 
When the AI training code is instrumented with [Aim Python Library](#python-library) and ran, aim automatically creates a `.aim` directory where the project is located. All the metadata tracked during training via the Python Library is stored in `.aim`.
Also see [`aim init`](#init) - an optional and alternative way to initialize aim repository.

## Python Library
Use Python Library to instrument your training code to record the experiments.
The instrumentation only takes 2 lines:
```py
import aim
```
Afterwards, simply use the two following functions to track metrics and any params respectively.

```py
...
aim.track(metric_val, name='metric_name', epoch=current_epoch)
aim.set_params(hyperparam_dict, name='dict_name')
...
```

### track
aim.**track**_(value, name='metric_name' [, epoch=epoch] [, **context_args]) <sub>[source](https://github.com/aimhubio/aim/blob/6ef09d8d77c517728978703764fc9ffe323f12b0/aim/sdk/track.py#L6)</sub>_

_Parameters_
- **value** - the metric value of type `int`/`float` to track/log
- **name** - the name of the metric of type `str` to track/log (preferred divider: `snake_case`)
- **epoch** - an optional value of the epoch being tracked
- **context_args** - any set of other parameters passed would be considered as key-value context for metrics

_Examples_
```py
aim.track(0.01, name='loss', epoch=43, subset='train', dataset='train_1')
aim.track(0.003, name='loss', epoch=43, subset='val', dataset='val_1')
```
Once tracked this way, the following search expressions will be enabled:
```py
loss if context.subset in (train, val) # Retrieve all losses in both train and val phase
loss if context.subset == train and context.dataset in (train_1) # Retrieve all losses in train phase with given datasets
```
Please note that any key-value could be used to track this way and enhance the context of metrics and enable even more detailed search.

Search by context example [here](http://demo-1.aimstack.io/?search=eyJjaGFydCI6eyJzZXR0aW5ncyI6eyJ5U2NhbGUiOjAsImRpc3BsYXlPdXRsaWVycyI6ZmFsc2V9LCJmb2N1c2VkIjp7ImNpcmNsZSI6eyJhY3RpdmUiOmZhbHNlLCJydW5IYXNoIjpudWxsLCJtZXRyaWNOYW1lIjpudWxsLCJ0cmFjZUNvbnRleHQiOm51bGwsInN0ZXAiOm51bGx9fX0sInNlYXJjaCI6eyJxdWVyeSI6Imxvc3MgaWYgcGFyYW1zLmxlYXJuaW5nX3JhdGUgPj0gMC4wMSBhbmQgY29udGV4dC5zdWJzZXQgaW4gKHZhbCwgdHJhaW4pIiwidiI6MX19):

### set_params
aim.**set_params**_(dict_value, name) <sub>[source](https://github.com/aimhubio/aim/blob/6ef09d8d77c517728978703764fc9ffe323f12b0/aim/sdk/track.py#L11)</sub>_

_Parameters_
- **dict_value** - Any dictionary relevant to the training
- **name** - A name for dictionaries

_Examples_
```py
 # really any dictionary can go here
hyperparam_dict = {
  'learning_rate': 0.0001,
  'batch_siz': 32}
aim.set_params(hyperparam_dict, name='params')
```
The following params can be used later to perform the following search experssions
```py
loss if params.learning_rate < 0.01 # All the runs where learning rate is less than 0.01
loss if params.learning_rate == 0.0001 and params.batch_size == 32 # all the runs where learning rate is 0.0001 and batch_size is 32
```
**_Note:_** if the `set_params` is called several times with the same name all the dictionaries will add up in one place on the UI.

### Session
Use Session to specify custom `.aim` directory or the experiment from the code.

_Class_ aim.**Session**_([repo,] [experiment])<sub>[source](https://github.com/aimhubio/aim/blob/develop/aim/sdk/session/session.py)</sub>_

Create session to specify the repo location and/or the experiment.

_Parameters_
- **repo** - Full path to parent directory of Aim repo - the `.aim` directory
- **experiment** - A name of the experiment. See [concepts](#concepts)

_Returns_
- Session object to attribute recorded training run to.

_Methods_

- [`track()`](#track) - Tracks metrics within the session

- [`set_params()`](#set_params) - Sets session params

- `close()` - Closes the session. If not invoked, the session will be automatically closed when the training is done.

_Examples_

- [Here](https://github.com/aimhubio/aim/tree/develop/examples/sessions) are a few examples of how to use the `aim.Session` in code

## Automatic Tracking

Automatic tracking allows you to track metrics without the need for explicit track statements.

### TensorFlow and Keras

Pass an instance of `AimTracker.metrics([session])` to keras callbacks.

_Parameters_
- **session** - Aim Session instance(optional)

- [Here](https://github.com/aimhubio/aim/blob/develop/examples/keras_track.py#L67) is an example

## Searching Experiments
[AimQL](https://github.com/aimhubio/aim/wiki/Aim-Query-Language) is a super simple, python-like search that enables rich search capabilities to search experiments.
Here are the ways you can search on Aim:

- **Search by experiment name** - `experiment == {name}`
- **Search by run** - `run.hash == "{run_hash}"` or `run.hash in ("{run_hash_1}", "{run_hash_2}")` or `run.archived is True`
- **Search by param** - `params.{key} == {value}`
- **Search by context** - `context.{key} == {value}`

### Search Examples
- Display the losses and accuracy metrics of experiments whose learning rate is 0.001:
  - `loss, accuracy if params.learning_rate == 0.001`
- Display the train loss of experiments whose learning rate is greater than 0.0001:
  - `loss if context.subset == train and params.learning_rate > 0.0001`

Check out this demo [dev-environment](http://demo-1.aimstack.io/?search=eyJjaGFydCI6eyJzZXR0aW5ncyI6eyJ5U2NhbGUiOjAsImRpc3BsYXlPdXRsaWVycyI6ZmFsc2V9LCJmb2N1c2VkIjp7ImNpcmNsZSI6eyJhY3RpdmUiOnRydWUsInN0ZXAiOjI0LCJydW5IYXNoIjoiZGM3OGFjOGEtYzJkZC0xMWVhLWI2Y2ItMGExOTU0N2ViYjJlIiwibWV0cmljTmFtZSI6Imxvc3MiLCJ0cmFjZUNvbnRleHQiOiJiblZzYkEifX19LCJzZWFyY2giOnsicXVlcnkiOiJsb3NzIGlmIHBhcmFtcy5sZWFybmluZ19yYXRlID4gMC4wMSBvciBuZXQuY29udjFfc2l6ZSA9PSA2NCIsInYiOjF9fQ==) deployment to play around with search.

## Command Line Interface

Aim CLI offers a simple interface to easily organize and record your experiments.
Paired with the [PyThon Library](#python-library), Aim is a powerful utility to record, search and compare AI experiments.
Here are the set of commands supported:


| Command       | Description                                                          |
| --------------| -------------------------------------------------------------------- |
| `init`        | Initialize the `aim` repository.                                     |
| `version`     | Displays the version of aim cli currently installed.                 |
| `experiment`  | Creates a new experiment to group similar training runs into.        |
| `de`          | Starts the AI Development Environment.                               |
| `up`          | An alias to `aim de up`.                                             |

### init
__**This step is optional.**__
Initialize the aim repo to record the experiments.
```shell
$ aim init
```
Creates `.aim` directory to save the recorded experiments to.
Running `aim init` in an existing repository will prompt the user for re-initialization.

  **_Beware:_** Re-initialization of the repo clears `.aim` folder from previously saved data and initializes new repo.
  **_Note:_** This command is not necessary to be able to get started with Aim as aim is automatically initializes with the first aim function call.

### version
Display the version of the currently installed Aim CLI.
```shell
$ aim version
```

### experiment
Create new experiments to organize the training runs related to the same experiment
Here is how it works:
```shell
$ aim experiment COMMAND [ARGS]
```
| Command    | Args                            | Description                                               |
| -----------| ------------------------------- | --------------------------------------------------------- |
| `add`      | `-n` &#124; `--name <exp_name>` | Add new experiment with a given name.                     |
| `checkout` | `-n` &#124; `--name <exp_name>` | Switch/checkout to an experiment with given name.         |
| `ls`       |                                 | List all the experiments of the repo.                     |
| `rm`       | `-n` &#124; `--name <exp_name>` | Remove an experiment with the given name.                 |

***Disclaimer:*** Removing the experiment also removes the recorded experiment data.

### de
AI Development Environment is a web app that runs locally on researcher's training environment,  mounts the `.aim` folder and lets researchers manage, search and start new training runs.

Start up the AI Development Environment (ADE)
```shell
$ aim de [COMMAND]
```
***Disclaimer:*** ADE uses docker containers to run and having docker installed in the training environment is mandatory for ADE to run.
Most of the environments nowadays have docker preinstalled or installed for other purposes so this should not be a huge obstacle to get started with ADE.

| Command   | Args                            | Description                                               |
| --------- | ------------------------------- | --------------------------------------------------------- |
| `up`      | `-p <port>` &#124; `-v version` | Starts the AI Development Environment for the given repo  |
| `down`    |                                 | Turn off the AI Development Environment                   |
| `pull`    | `-v <version>`                  | Pull the ADE of the given version                         |
| `upgrade` |                                 | Upgrade the ADE to its latest version                     |

### up
An alias to `aim de up` :
```shell
$ aim up
```

### down
An alias to `aim de down`:
```shell
$ aim down
```

## TensorBoard Experiments
Easily run Aim on experiments visualized by TensorBoard. Here is how:
```
$ aim up --tf_logs path/to/logs
```
This command will spin up Aim on the TensorFlow summary logs and load the logs recursively from the given path.
Use `tf:` prefix to select and display metrics logged with tf.summary in the dashboard, for example `tf:accuracy`.

Tensorboard search example [here](http://demo-1.aimstack.io/?search=eyJjaGFydCI6eyJzZXR0aW5ncyI6eyJ5U2NhbGUiOjAsImRpc3BsYXlPdXRsaWVycyI6ZmFsc2V9LCJmb2N1c2VkIjp7ImNpcmNsZSI6eyJhY3RpdmUiOmZhbHNlLCJydW5IYXNoIjpudWxsLCJtZXRyaWNOYW1lIjpudWxsLCJ0cmFjZUNvbnRleHQiOm51bGwsInN0ZXAiOm51bGx9fX0sInNlYXJjaCI6eyJxdWVyeSI6Imxvc3MsIHRmOmFjY3VyYWN5IGlmIHBhcmFtcy5sZWFybmluZ19yYXRlID4gMC4wMSBvciBuZXQuY29udjFfc2l6ZSA9PSA2NCBvciBwYXJhbXMudGZfbGVhcm5pbmdfcmF0ZSA9PSAwLjAwMSIsInYiOjF9fQ==)

## How it works
The stack of projects that enable AI Development Environment:
<img src="https://user-images.githubusercontent.com/3179216/86802291-f0b81280-c085-11ea-8715-6fd650c4a45d.png">
- [Aim](#aim) - Version Control for AI Experiments.
- [Aim Records](https://github.com/aimhubio/aimrecords) - an effective storage to store recorded AI metadata.
- [Aim DE](https://github.com/aimhubio/aimde) - AI Development Environment to record, search and compare the training runs.
