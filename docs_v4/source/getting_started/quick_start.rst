.. _quick-start:

#########################
 Quick start
#########################

Start in 3 steps
-------------------------

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

Run your first Aim app
---------------------------------------

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

Integrations with your favorite frameworks
------------------------------------------
The default Aim experiment tracker app has the integrations with all of the  

Aim experiment tracing  has the `ml` package that enables the integrations with most prominent ML tools.
Usage:

.. code-block:: python

  from aimstack.ml import AimLogger

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

More examples and integrations can be found here: [The packages Readme link with all integrations]()

.. toctree::
  :maxdepth: 2
  :name: quick_start
  :hidden:

  ./quick_start/logging_basics.rst