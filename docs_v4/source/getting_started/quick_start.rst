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

Run the Aim Server
.. code-block:: console

  aim server

Run the Aim UI
.. code-block:: console

  aim ui

Download and run your first Aim package
---------------------------------------

Aim packages are composable observability applications built with Aim SDK and run by Aim SDK.
They are distributed as Python packages and can be shared, installed with pip. 

Aim comes with a number of prebuilt packages. You can find them on `AimStack <https://aimstack.io>`_.

Compose multiple Aim packages into one project
----------------------------------------------

Integrations with your favorite frameworks
-------------------------------------------
