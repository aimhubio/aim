####################
Logging Abstractions
####################

Aim is built to log vast quantities of logs from every part of the AI Systems.
There are three main concepts when logging with Aim:
- Records - a single log entry
- Sequences - a collection of records
- Containers - a set of interconnected sequences

These concepts together allow organize, log and query any kind of python objects in sequences.

.. image:: https://docs-blobs.s3.us-east-2.amazonaws.com/v4-images/guides/logging-abstractions.png
    :alt: Logging Abstractions
    :align: center
    :width: 70%

Records
-------
Record is the single unit of item in the log. Records can be any python objects. 

AimStack base app comes with a number of predefined records such as Number, Text, Image, etc.

Sequences
---------
Sequences are a sequences or Records.
Sequences are the main interface for logging. `Metric` is an example of a sequence.

.. code-block:: python

    # Create a metric
    metric = Metric(run, name='loss', context={'epoch': 1})

    for i in range(1000):
        metric.track(i, epoch=1)


Aim comes with a number of predefined sequences such as Metric, SystemMetric, TextSequence.


Containers
----------
Containers are a set of interconnected sequences.
Role of the container is to help organize the logged records and sequences into coherent structure that will be queryable.

Containers also allow an elegant design of every part of the AI System - Training Run, Model Eval, Production, LLM experiment etc.
Aim comes with a number of predefined containers such as Run.

.. code-block:: python

  from aimstack.base import Run, Metric

  # Create a run
  run = Run()

  run['hparams'] = {
      'lr': 0.001,
      'batch_size': 32
  }