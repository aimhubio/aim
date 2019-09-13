# aim branching

This document describes the ways branching can be implemented in aim.
All ideas/solutions/approaches go here.

### Iteration 1 (13 sep, 2019): Branch-experiment realisation

![branch experiment_iteration_1](https://i.imgur.com/odwjWxT.jpg "Branch-experiment workflow and implementation")

Main idea of this realisation is to define two types of objects - a branch and an experiment

- experiment: the state after one run of a training process. Experiment is an atomic object, any further action will rewrite current experiment or create a new one. Experiment has no ancestor and no descendant
- branch: an isolated set of experiments

#### Pros:

- easy to manage research, experiments are stored in logically separated branches
