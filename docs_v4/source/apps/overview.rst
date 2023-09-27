########
Overview
########

What are Aim apps?
==================
As part of building software and products we use a number of logging applications such as tensorboard, weights and biases, kibana, grafana, arize etc.
Each one of these are logging applications - they enable a mechanism to log data, observe it and (if available) automate around it.

Aim is an operating system for logs. 

Aim logging apps are python packages that combine logging, observability and automations all-in-one.

.. image:: https://docs-blobs.s3.us-east-2.amazonaws.com/v4-images/apps/aim-app-structure.png
   :alt: Aim app structure
   :width: 500px
   :align: center

Why do logging Apps matter?
===================
Logging apps are key component in the software development stack and processes.
They enable teams to understand what is going on in the software and how it behaves.

.. image:: https://docs-blobs.s3.us-east-2.amazonaws.com/v4-images/apps/software-logging-evolution.png
   :alt: Software logging evolution
   :align: center

Due to the rise of AI Systems, the complexity of observability has grown significantly.
Logging AI Metadata, observing it end-to-end is key to fundamental problems such as:

- Geovernance
- Lineage
- Reproducibility
- Debugging
- Full attribution and safety

Aim enables building apps for all of these use-cases.
With the ability generically log everything in the AI System, Aim apps can encompass the UI and automations required to satisfy these use-cases sustainably without vendor lockin through community and ecosystem effort.

Out-of-the-box Aim apps
================

ML Experiment Tracking
====================================
The ML Experiment Tracking Integrations are default available with Aim. 
These are a set of experiment tracker specific integrations that connect to the respective fraeworks and their trainers.

It takes one line to add these loggers to your training script and start logging your experiments to Aim.

It's plug and go. No need to change your training script or your workflow.

.. toctree::
  :maxdepth: 3
  :caption: ML Experiment Tracking Integration apps

  ./pytorch_ignite_tracker.rst
  ./pytorch_lightning_tracker.rst
  ./huggingface_tracker.rst
  ./keras_tracker.rst
  ./keras_tuner_tracker.rst
  ./xgboost_tracker.rst
  ./catboost_tracker.rst
  ./lightgbm_tracker.rst
  ./fastai_tracker.rst
  ./mxnet_tracker.rst
  ./optuna_tracker.rst
  ./paddle_paddle_tracker.rst
  ./stable_baselines3_tracker.rst
  ./acme_tracker.rst
  ./prophet_tracker.rst


AI Systems Tracking
====================================
The AI Systsems Tracking are available in Aim by default.
It consists of a set of trackers that connect to the latest AI systems and keep track of your interaction metadata.
These systems seamlessly integrate with your existing AI pipelines.

.. toctree::
  :maxdepth: 3
  :caption: AI Systems Tracking Apps

  ./llamaindex_retriver.rst
  ./langchain_chatbot.rst
