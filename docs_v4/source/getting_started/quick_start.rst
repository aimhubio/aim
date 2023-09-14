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

  from aimstack.asp import Metric, Run

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

3. Run Aim Server and Aim UI

.. code-block:: console

  aim server
  aim ui

Log your first project
======================

Aim logs everything int o a `Repo` which is a collection of `Container` objects.
ML training `Run` is kind of a `Container`. 

`Container` is a set of `Sequence` objects interconnected by config dictionary. 

`Sequence` is a sequence of `Record` objects.
`Metric` is a Sequence of `Number` objects.

The default Aim installation includes the `aimstack.base` app which contains all the primitives of logging.

Here is how to add Aim to your project and start logging straight away.

Logger configuration
--------------------

.. code-block:: python

  import aim
  from aimstack.asp import Run  

  # Create a run
  aim_run = Run(repo='/path/to/repo/.aim')

It's also possible to run Aim remotely, in that case the repo will be a uri to the remote repo.

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

You can create as many metrics and other such sequences as your project requires.
Fundamentally Aim provides all the tools to log everything from everywhere.

Run your first Aim app
======================

Aim apps are composable logging and observability applications built with Aim SDK and run by Aim.
They are distributed as Python packages and can be shared, installed with pip.

Aim comes with a number of prebuilt apps.
In this instance, we will install the aimlflow app which provides auto-sync with mlflow and a dashboard on Aim of what was synced and when.
Combined with the default experiment tracking app, users can have all the beautiful aim features eneabled autoamtically over mlflow logs.

.. code-block:: console

  pip install aimlflow
  aim register aimlflow, aiml
  aim server
  aim ui

This will enable both apps on Aim UI.


Integration with ML frameworks
==============================

The Aim experiment tracker app has the integrations with all major ML frameworks and libraries.

All those integrations are available as separate apps and default installed with the Aim experiment tracker as well as the ml app.

.. code-block:: python

  from aimstack.ml import AimLogger

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
