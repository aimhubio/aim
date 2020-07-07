# AIM

![GitHub Top Language](https://img.shields.io/github/languages/top/aimhubio/aim) [![PyPI Package](https://img.shields.io/pypi/v/aim-cli?color=yellow)](https://pypi.org/project/aim-cli/) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A super-easy way to record, search and compare AI experiments.
**As easy as starting a Jupyter Notebook!**

## Getting Started in three steps
1. Install Aim in your training environment
```shell
pip3 install aim-cli
```
2. Import Aim in your training code
```py
import aim
aim.init() # initialize aim recorder
...
aim.track(metric_value, 'my-meaningful-metric-name')
aim.track(hyperparam_dict, 'hyperparams-name-that-makes-sense')
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
  - [Aim V2](#aim-v2)
  - [Command Line Interface Examples](#command-line-interface-examples)
    - [aim init](#aim-init)
  - [Python SDK Examples](#python-sdk-examples)
  - [How to Use Development Environment](#how-to-use-development-environment)

## How it works
Aim Development Environment is a super-easy way to record, search and compare AI experiments.
Fundamental tech behind the Aim is the aim version control for AI which records and versions experiments and its adjacent metadata.
Aim version control uses AimRecords - an efficient records storage library that enables easy and efficient storage of experiment metadata generated during AI training
AI Development Environment enables an intuitive user interface to execute, record, search and compare the experiments.
### Workflow


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

## Aim V2
Currently available Aim Version is V2.0.1


## Command Line Interface examples
Aim CLI helps quickly initiate and navigate through basic version control features

### aim init
Initialize the aim repo to record the experiments.
```shell
$ aim init
```
Creates `.aim` directory to save the recorded experiments to.
Running `aim init` in an existing repository will ask to for user confirmation before re-initializing. Re-initializing the repo clears the old one and initializes a new empty one.

### Aim Version

## Python SDK examples

## How to use development environment




## Contributor Guide
Visit [contributor guide](docs/contributor-guide.md) for further details.
