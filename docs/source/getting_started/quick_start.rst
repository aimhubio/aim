###########
Quick start
###########

Start in 3 steps
=================

1. Install Aim

.. code-block:: console
  
    pip install aim

2. Initialize Aim in your project

.. code-block:: python

  from aimstack.base import Run, Metric

  # Create a run
  run = Run()

  run['hparams'] = {
      'lr': 0.001,
      'batch_size': 32
  }

  # Create a metric
  metric = Metric(run, name='loss', context={'epoch': 1})

  for i in range(1000):
        metric.track(i, epoch=1)

3. Run Aim Server

.. code-block:: console
  
  aim server

4. Run Aim UI

.. code-block:: console
  
  aim ui

Log your first project with Aim
===============================

Aim saves the logs into a `Repo`. Repo is a collection of `Container` objects.
ML training `Run` is kind of a `Container`. 

Container is a set of `Sequence` objects interconnected by config dictionaries.

`Sequence` is a sequence of `Record` objects.

`Metric` is a Sequence of `Number` objects.

Hyperparameters and environment variables are examples of a config dictionary.

Default Aim installation includes the `aimstack.base` app which contains all the primitives for logging.

Here is how to add Aim to your project and start logging straight away.

Logger configuration
--------------------
In this example, we use the default Run.

.. code-block:: python

  from aimstack.base import Run  

  # Create a run
  aim_run = Run(repo='/path/to/repo/.aim')

It's also possible to run Aim remotely, in that case the repo will be the destination of the remote aim deployment.

Configure and log the run
-------------------------

Once Run is initialized, you can configure it with parameters and log the run.

.. code-block:: python

  # Set run parameters
  aim_run['hparams'] = {
      'lr': 0.001,
      'batch_size': 32
  }

  # create a metric 
  my_metric = Metric(aim_run, name='my-metric', context={'env': 'aim-test'})

  my_metric.track(0.0002)
  my_metric.track(0.0003)
  my_metric.track(0.0004)

You can create as many metrics and other sequences as your project requires.
Fundamentally Aim provides all the tools to log everything from everywhere.

Integration with ML frameworks
==============================

The Aim experiment tracker app is well-integrated with major ML frameworks and libraries.

Those integrations are apps and are part of default Aim installation.

.. code-block:: python

  from aimstack.pytorch_lightning_tracker.loggers import BaseLogger as AimLogger

Pytorch Lightning example
-------------------------

Pytorch lighting provides trainer objects to simplify the training process of pytorch model. 
One of the parameters is called logger. 
We can use the logger function defined by aim to simplify the process of tracking experiments. 
This process is divided into 2 steps:

Step 1. Create AimLogger object

.. code-block::  python

  # track experimental data by using Aim
  aim_logger = AimLogger(
      experiment='aim_on_pt_lightning',
      train_metric_prefix='train_',
      val_metric_prefix='val_',
  )

Step 2. Pass the aim_logger object as the logger argument

.. code-block:: python

  # track experimental data by using Aim
  trainer = Trainer(gpus=1, progress_bar_refresh_rate=20, max_epochs=5, logger=aim_logger)
