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

Aim comes installed with a number of apps out of the box.

- **Base App** - the base app provides all the logging primitives and a logs observer UI
- **Experiment Tracker** - the experiment tracker helps track and manage experiments. It uses the base app primitives.
- **Langchain Debugger** - the LangChain debugger app helps trace and visualize Langchain execution and experiments.
- **LlamaIndex Debugger** - the LlamaIndex debugger app
- **OpenAI Debugger** - the OpenAI debugger app
- **Integration Apps** - set of apps for a number of ML and LLM frameworks + relevant experiment tracking UIs

You can see the list of apps by just running

.. code-block:: console

  aim apps ls

Install an Aim app
==================

Aim apps are python packages, they can be installed using pip.

.. code-block:: console

  pip install aim-app-package

Once the app is installed, you can register it with Aim and just run Aim UI:

.. code-block:: console

  aim register aim-app-package
  aim server
  aim ui

Aim allows to register as many apps as you'd need, the apps need to be provided in comma-separated list.

Create an Aim app
========================

.. note::
  
  Aim app development SDKs are still in alpha, however they are fully functional - we are doing final iterations with the community.

It's straightforward to create an Aim app.
Aim provides an app boilerplate and a number of apps are available under packages/aimstack.
[Link to the app creation guide]