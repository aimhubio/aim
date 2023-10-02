##################
Experiment Tracker
##################

About
=====
The Aim Experiment Tracker app helps to track and manage ML experiments.

For most ML frameworks, we have extended the experiment tracker app and created an app per integration.

Each app provides the views for the experiments specifically tracked by that framework.

Together, these apps provide acomplete ML experiment tracking and 
management experience for wide variety of type of data - from metrics to text to audio.

The Experiment Tracker app also provides the base experiment tracking and management abstractions - the users can extend them to their preferences.

All relevant ML framework integrations are provided out of the box.

.. raw:: html

  <div align="center">
    <sub>Integrates seamlessly with your favorite tools</sub><br/>
    <img src="https://user-images.githubusercontent.com/13848158/155354389-d0301620-77ea-4629-a743-f7aa249e14b5.png" width="60" />
    <img src="https://user-images.githubusercontent.com/13848158/155354496-b39d7b1c-63ef-40f0-9e59-c08d2c5e337c.png" width="60" />
    <img src="https://user-images.githubusercontent.com/13848158/155354380-3755c741-6960-42ca-b93e-84a8791f088c.png" width="60" />
    <img src="https://user-images.githubusercontent.com/13848158/155354342-7df0ef5e-63d2-4df7-b9f1-d2fc0e95f53f.png" width="60" />
    <img src="https://user-images.githubusercontent.com/13848158/155354392-afbff3de-c845-4d86-855d-53df569f91d1.png" width="60" />
    <img src="https://user-images.githubusercontent.com/13848158/155354355-89210506-e7e5-4d37-b2d6-ad3fda62ef13.png" width="60" />
    <img src="https://user-images.githubusercontent.com/13848158/155354397-8af8e1d3-4067-405e-9d42-1f131663ed22.png" width="60" />
    <br/>
    <img src="https://user-images.githubusercontent.com/13848158/155354513-f7486146-3891-4f3f-934f-e58bbf9ce695.png" width="60" />
    <img src="https://user-images.githubusercontent.com/13848158/155354500-c0471ce6-b2ce-4172-b9e4-07a197256303.png" width="60" />
    <img src="https://user-images.githubusercontent.com/13848158/155354361-9f911785-008d-4b75-877e-651e026cf47e.png" width="60" />
    <img src="https://user-images.githubusercontent.com/13848158/155354373-1879ae61-b5d1-41f0-a4f1-04b639b6f05e.png" width="60" />
    <img src="https://user-images.githubusercontent.com/13848158/155354483-75d9853f-7154-4d95-8190-9ad7a73d6654.png" width="60" />
    <img src="https://user-images.githubusercontent.com/13848158/155354329-cf7c3352-a72a-478d-82a7-04e3833b03b7.png" width="60" />
    <img src="https://user-images.githubusercontent.com/13848158/155354349-dcdf3bc3-d7a9-4f34-8258-4824a57f59c7.png" width="60" />
    <img src="https://user-images.githubusercontent.com/13848158/155354471-518f1814-7a41-4b23-9caf-e516507343f1.png" width="60" />
  </div>

Installation
------------
Installed out of the box with as part of default Aim installation.
Users can unregister and replace with any other app.

Usage
=====
The Aim default experiment tracker app usage is straightforward. 
Users just need to integrate the Run and the 


Integrate with code
-------------------
The Experiment Tracker can be added to the code like this:

.. code-block:: python

  from aimstack.experiment_tracker import Run, Experiment  
  from aimstack.base import Metric

  run = Run()

  run['hparams'] = {
    'lr': 0.001,
    'batch_size': 32,
    'epochs': 10,
  }

  metric = Metir(run, name='loss', context={'subset': 'train'})

  for i in range(1000):
    metric.track(i, epoch=1)


Start the UI
------------
Once the code is run, the UI is very straightforward to start. 
With the default Aim installation, just run:

.. code-block:: bash

  aim ui

The UI will be available at http://0.0.0.0:43800

Experiment Tracking UI
======================
The Experiment Tracking UI has three main sections:

- **Overview page:** a high-level overview of what's been tracked and their quantities
- **Experiment page:** a grouped view of training runs
- **Single Run page:** a detailed view of a single training run
- **Runs page:** a searchable list of all runs

These views together with the Aim explorers provide a complete experiment tracking and management solution.

Using Explorers with Experiment Tracking
----------------------------------------
Aim Explorers are specialized in comparing large quantities of logs of the same type.

There are wide variety of explorers available out of the box - from metrics to text to audio.

The Experiment Tracker app provides the base experiment management while the Explorers are the backbone of metric comparison. And overall comparison of lots of other type of logs.

.. image:: https://docs-blobs.s3.us-east-2.amazonaws.com/v4-images/guides/experiment-tracker-screenshot.png
  :width: 100%
  :alt: Aim Experiment Tracker


Using Reports with Experiment Tracking
--------------------------------------
Aim also has Reports available that are highly integrated with all the rest of the pages.
Any logged data can be rendered in the Reports. 

Reports are a knowledge-base on top of the logs. They are a great way to share knowledge and insights with the team.

Integrating to existing code
============================
Aim Experiment Tracker is integrated with all the major ML frameworks via the Integration Apps.

If you are already using one of the supported frameworks, you can start using Aim right away.

Example: HuggingFace integration
--------------------------------
Here is how the HuggingFace integration works:

.. code-block:: python

  from aimstack.huggingface import AimCallback

  trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    callbacks=[AimCallback()],
  )

  trainer.train()

.. toctree::
  :maxdepth: 3
  :hidden:

  ./experiment_tracker/pytorch_ignite_tracker.rst
  ./experiment_tracker/pytorch_lightning_tracker.rst
  ./experiment_tracker/huggingface_tracker.rst
  ./experiment_tracker/keras_tracker.rst
  ./experiment_tracker/keras_tuner_tracker.rst
  ./experiment_tracker/xgboost_tracker.rst
  ./experiment_tracker/catboost_tracker.rst
  ./experiment_tracker/lightgbm_tracker.rst
  ./experiment_tracker/fastai_tracker.rst
  ./experiment_tracker/mxnet_tracker.rst
  ./experiment_tracker/optuna_tracker.rst
  ./experiment_tracker/paddle_paddle_tracker.rst
  ./experiment_tracker/stable_baselines3_tracker.rst
  ./experiment_tracker/acme_tracker.rst
  ./experiment_tracker/prophet_tracker.rst
