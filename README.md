# Aim

![GitHub Top Language](https://img.shields.io/github/languages/top/aimhubio/aim) [![PyPI Package](https://img.shields.io/pypi/v/aim-cli?color=yellow)](https://pypi.org/project/aim-cli/) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A super-easy way to record, search and compare AI experiments.

<img src="https://user-images.githubusercontent.com/13848158/90840111-2bda8080-e36a-11ea-9d24-46b38f4284a3.png">

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
  - [Command Line Interface](#command-line-interface)
    - [init](#init)
    - [version](#version)
    - [experiment](#experiment)
    - [de](#de)
    - [up](#up)
    - [down](#down)
  - [Python Library](#python-library)
  - [Searching Experiments](#searching-experiments)
    - [Search Examples](#search-examples)
  - [TensorBoard Experiments](#tensorboard-experiments)
  - [How It Works](#how-it-works)
  - [Sneak Peek at AI Development Environment](#sneak-peek-at-ai-development-environment)
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

## Command Line Interface

Aim CLI offers a simple interface to easily organize and record your experiments.
Paired with the [PyThon Library](#python-library), Aim is a powerful utility to record, search and compare AI experiments.
Here are the set of commands supported:


| Command       | Description                                                          |
| --------------| -------------------------------------------------------------------- |
| `init`        | Initialize the `aim` repository.                                     |
| `version`     | Displays the version of aim cli currently installed.                 |
| `experiment`  | Creates a new experiment branch to group similar training runs into. |
| `de`          | Starts the AI Development Environment.                               |
| `up`          | An alias to `aim de up`.                                             |

### init
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
Create new experiment branches to organize the training runs related to the same experiment
Here is how it works:
```shell
$ aim experiment COMMAND [ARGS]
```
| Command    | Args                            | Description                                               |
| -----------| ------------------------------- | --------------------------------------------------------- |
| `add`      | `-n` &#124; `--name <exp_name>` | Add new experiment branch with a given name.              |
| `checkout` | `-n` &#124; `--name <exp_name>` | Switch/checkout to an experiment branch with given name.  |
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

## Python Library
Use Python Library to instrument your training code to record the experiments.
The instrumentation only takes 2 lines:
```py
import aim
```
Afterwards, simply use the two following functions to track metrics and any params respectively.

```py
...
aim.track(metric_value, name='metric_name', epoch=current_epoch)
aim.set_params(dict, name='hyperparams-name-that-makes-sense')
...
```
Please note that in `aim.track` the `epoch=current_epoch` is optional

### Metric context
Add context to your metrics by adding additional key-value arguments to your `aim.track` function. Here is how it works:
```py
aim.track(loss_val, name='loss', epoch=epoch_val, phase='train', dataset='train_1')
aim.track(loss_val, name='loss', epoch=epoch_val, phase='val', dataset='val_1')
```
Once tracked this way, the following search expressions will be enabled:
```py
loss if context.phase in (train, val) # Retrieve all losses in both train and val phase
loss if context.phase == train and context.dataset in (train_1) # Retrieve all losses in train phase with given datasets
```
Please note that any key-value could be used to track this way and enhance the context of metrics and enable even more detailed search.

Search by context example [here](http://demo-1.aimstack.io/?search=eyJjaGFydCI6eyJzZXR0aW5ncyI6eyJ5U2NhbGUiOjAsImRpc3BsYXlPdXRsaWVycyI6ZmFsc2V9LCJmb2N1c2VkIjp7ImNpcmNsZSI6eyJhY3RpdmUiOmZhbHNlLCJydW5IYXNoIjpudWxsLCJtZXRyaWNOYW1lIjpudWxsLCJ0cmFjZUNvbnRleHQiOm51bGwsInN0ZXAiOm51bGx9fX0sInNlYXJjaCI6eyJxdWVyeSI6Imxvc3MgaWYgcGFyYW1zLmxlYXJuaW5nX3JhdGUgPj0gMC4wMSBhbmQgY29udGV4dC5zdWJzZXQgaW4gKHZhbCwgdHJhaW4pIiwidiI6MX19):

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

## Sneak peek at AI development environment
Demo AimDE: [http://demo-1.aimstack.io/](http://demo-1.aimstack.io/)

#### Aim search experience
![AimDE Panel](https://user-images.githubusercontent.com/3179216/90963471-eaacb280-e4c8-11ea-9ee4-9e51ba22cb45.gif)

#### All experiments at hand
![AimDE Experiments](https://user-images.githubusercontent.com/3179216/90963706-1a5cba00-e4cb-11ea-8fab-619bc73fbb9d.gif)
