# AIM

![GitHub Top Language](https://img.shields.io/github/languages/top/aimhubio/aim) [![PyPI Package](https://img.shields.io/pypi/v/aim-cli?color=yellow)](https://pypi.org/project/aim-cli/) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A super-easy way to record, search and compare AI experiments.
**As easy as starting a Jupyter Notebook!**

## Getting started in three steps
1. Install Aim in your training environment
```shell
pip3 install aim-cli
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
aim up
```

## Contents

- [AIM](#aim)
  - [Contents](#contents)
  - [Getting started - in three steps](#getting-started-in-three-steps)
  - [How It Works](#how-it-works)
  - [Installation](#installation)
  - [Documentation](#documentation)
    - [Command Line Interface](#command-line-interface)
      - [init](#init)
      - [version](#version)
      - [status](#status)
      - [experiment](#experiment)
      - [up](#up)
    - [Python Library](#python-library)
      - [metric](#metric)
      - [hyperparams](#hyperparams)
  - [End to End Examples](#python-sdk-examples)
  - [How to Use Development Environment](#how-to-use-development-environment)
  - [Contributor Guide](#contributor-guide)

## How it works
Aim Development Environment is a super-easy way to record, search and compare AI experiments.
Fundamental tech behind the Aim is the aim version control for AI which records and versions experiments and its adjacent metadata.
Aim version control uses AimRecords - an efficient records storage library that enables easy and efficient storage of experiment metadata generated during AI training
AI Development Environment enables an intuitive user interface to execute, record, search and compare the experiments.

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
Aim CLI is installed via command
```shell
$ pip3 install aim-cli
```
Once installed, it offers a simple CLI to easily organize and record the experiments.
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
Create new experiment branches to organize the training runs related to the same experiment
Here is how it works:
```shell
$ aim experiment COMMAND [ARGS]
### experiment
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

| Command        | Args                             | Description                                                                                |
| -------------- | -------------------------------  | ------------------------------------------------------------------------------------------ |
| `up`           | `-p <port>` &#124; `-v version`  | Starts the AI Development Environment for the given repo                                   |
| `down`         |                                  | Turn off the AI Development Environment and the docker container that the ADE is running on|
| `pull`         | `-v <version>`                   | Pull the ADE of the given version                                                          |
| `upgrade`      |                                  | Upgrade the ADE to its latest version                                                      |

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

## How to use development environment

## Contributor Guide
Visit [contributor guide](docs/contributor-guide.md) for further details.
