# Aim

![GitHub Top Language](https://img.shields.io/github/languages/top/aimhubio/aim) [![PyPI Package](https://img.shields.io/pypi/v/aim-cli?color=yellow)](https://pypi.org/project/aim-cli/) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A super-easy way to record, search and compare AI experiments.

<img src="https://user-images.githubusercontent.com/3179216/86801320-eea18400-c084-11ea-8480-87ee60ae95cd.png">

## Getting started in three steps
1. Install Aim in your training environment and init in the project folder
```shell
$ pip3 install aim-cli
$ aim init
```
2. Import Aim in your training code
```py
import aim
aim.init() # initialize aim recorder
...
aim.track(metric_value, name='my-meaningful-metric-name', epoch=the_epoch)
aim.track(hyperparam_dict, namespace='hyperparams-name-that-makes-sense')
```
3. Run the training and start the AI Dev Environment
```shell
$ aim up
```

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
  - [Python Library](#python-library)
  - [Searching Experiments](#searching-experiments)
    - [Search Examples](#search-examples)
  - [TensorBoard Experiments](#tensorboard-experiments)
  - [How It Works](#how-it-works)
  - [Sneak Peek at AI Development Environment](#sneak-peek-at-ai-development-environment)
  - [Contributor Guide](https://github.com/aimhubio/aim/wiki/Contributing)

## Installation
To install Aim, you need to have python3 and pip3 installed in your environment
1. Install Aim python packaage
```shell
$ pip3 install aim-cli
```
Aim Development Environment requires Docker to be installed in the environment.
Run the command to start the aim development environment.
```shell
$ aim up
```

## Command Line Interface

Aim CLI offers a simple interface to easily organize and record the experiments.
Paired with the [PyThon Library](#python-library), Aim becomes a powerful utility to record, search and compare AI experiments.
This is how the commands look like:


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
Also see how to initialize repo safely by Python Library.

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

## Python Library
Use Python Library to instrument your training code to record the experiments.
The instrumentation only takes 2 lines:
```py
import aim
aim.init()
```
Afterwards, simply use the `aim.track` function to track either metrics or hyperparameters (any dict really).
```py
...
aim.track(metric_value, name='my-meaningful-metric-name', epoch=current_epoch)
aim.track(hyperparam_dict, namespace='hyperparams-name-that-makes-sense')
...
```
Use `track` function anywhere with any framework to track the metrics. Metrics with the same `name` or `namespace` will be collected and rendered together.

## Searching Experiments
Aim enables rich search capabilities to search experiments.
Here are the ways you can search on Aim:

- **Search by metric** - `metric:metric_name`
- **Search by param** - `param:param_key=param_value`
- **Search by tag** - `tag:tag_name`

### Search Examples
- Display the losses of experiments tagged as benchmark whose learning rate is 0.001:
  - `metric:loss tag:benchmark param:learning_rate=0.001`
- Display the accuracies of experiments tagged as daily:
  - `metric:accuracy tag:daily`

## TensorBoard Experiments
Easily run Aim on experiments tracked by TensorBoard. Here is how:
```
$ aim up --tf_logs path/to/logs
```
This command will spin up Aim on the tensorboard logs and load the logs recursively from the given logs path.
To make TensorBoard logs also appear in the dashboard, just add the following to the search bar:
`inclue:tf_logs` - search by the tf_scalar
Everything else is the same for the search.

## How it works
The stack of projects that enable AI Development Environment:
<img src="https://user-images.githubusercontent.com/3179216/86802291-f0b81280-c085-11ea-8715-6fd650c4a45d.png">
- [Aim](#aim) - Version Control for AI Experiments.
- [Aim Records](https://github.com/aimhubio/aimrecords) - an effective storage to store recorded AI metadata.
- [Aim DE](https://github.com/aimhubio/aimde) - AI Development Environment to record, search and compare the training runs.

## Sneak peek at AI development environment
Demo AimDE: [http://demo-1.aimstack.io/](http://demo-1.aimstack.io/)

#### The search and compare panel
![AimDE Panel](https://user-images.githubusercontent.com/3179216/87037877-fe90a380-c1fd-11ea-9242-05ea1798a176.gif)

#### All experiments at hand
![AimDE Experiments](https://user-images.githubusercontent.com/3179216/87040316-95129400-c201-11ea-97e5-519ac6ffba94.gif)

#### Easily start new experiments
![AimDE Processes](https://user-images.githubusercontent.com/3179216/87042902-57176f00-c205-11ea-830e-e69168b9d269.gif)

#### Tag the experiments / training runs for better search
![AimDE Tags](https://user-images.githubusercontent.com/3179216/87041412-3fd78200-c203-11ea-8cca-27a26752df99.gif)
