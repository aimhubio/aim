## Overview

Aim UI is one of the key two interfaces to interact with the ML training runs tracked by Aim.
It's super-powerful for comparing large number of experiments.

The Aim UI is mainly built around the Explorers that allow to query and compare metrics, images and params, scatterplots etc.

Explorers are built around the way to query runs and compare them. Each explorer has a way to navigate to a single run where all the run-related information is visualized and can be used to do deep-dive into runs.

Besides these, Aim UI also allows to tag the runs, delete/archive them and save Explorers state to share with the team.

### Pythonic Search
Once you track your experiments with Aim, they are available to be searched.
There are three objects that could be searched:
- Runs
- Metrics
- Images

This basically means that you can write a python if-statement over everything you have tracked with a few options of the output.

Explorers encompass these outputs and give you unique supwer-powers to manipulate and compare the results of the search.

### Explorers
Explorers are powerful tools to query ML training runs, select specific type of data tracked (metrics, params etc), apply modifications to them and compare them.

The runs are compared by grouping and dividing them via the tracked hyperparams.
**Every** param (even the system params) are available on Aim - to be used for runs comparison on all Explorers.


### Runs Management
Runs Management includes the Runs Explorer.
You can search through runs on the Runs Explorer and have the holistic view of your runs, their diff, the last values of the metrics, all the params etc.

This also contains the Single Run Page that will help you observer everything you have tracked for your run - all in one place. This includes params, metrics, images, distributions etc.


### Other Aim UI features
Besides this, you can also save the Explorer states for reproducible experiment analysis.
Aim also enables ways to tag the runs.
