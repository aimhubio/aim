# AIM

![GitHub Top Language](https://img.shields.io/github/languages/top/aimhubio/aim) [![PyPI Package](https://img.shields.io/pypi/v/aim-cli?color=yellow)](https://pypi.org/project/aim-cli/) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A super-easy way to record, search and compare AI experiments.
**As easy as starting a Jupyter Notebook!**

## Getting started - in three steps
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

## Contributor Guide
Visit [contributor guide](docs/contributor-guide.md) for further details.
