#################
PyTorch Lightning
#################


`AimCallback` for `PyTorch Lightning` is designed to enhance your experiment logging and monitoring. It thoroughly records essential information, including hyperparameters, training, validation, and test time metrics like loss and accuracy. Moreover, it offers comprehensive system usage tracking, keeping an eye on CPU and GPU memory utilization.

The work is designed to build an image classifier to solve a famous real-world problem ——handwritten digit recognition. In this work, we will introduce how to introduce aim logger to manage output information.

We only require 2 steps to simply and easily inject Aim into PyTorch Lightning:

.. code-block:: python

    from aimstack.pytorch_lightning_tracker.loggers import BaseLogger as AimLogger

PyTorch Lightning provides trainer objects to simplify the training process of PyTorch models. One of the parameters is called logger. We can use the logger function defined by Aim to simplify the process of tracking experiments. This process is divided into 2 steps:

Step 1. Create `AimLogger` object

.. code-block:: python

    # track experimental data by using Aim
    aim_logger = AimLogger(
        experiment="test_experiment",
        train_metric_prefix="train_",
        val_metric_prefix="val_",
    )

Step 2. Pass the `aim_logger` object as the `logger` argument

.. code-block:: python

    # track experimental data by using Aim
    trainer = Trainer(gpus=1, progress_bar_refresh_rate=20, max_epochs=5, logger=aim_logger)

See `AimLogger` source `here <https://github.com/aimhubio/aim/blob/main/pkgs/aimstack/pytorch_lightning_tracker/callbacks/base_callback.py>`_.
Check out a simple example `here <https://github.com/aimhubio/aim/blob/main/examples/pytorch_lightning_track.py>`_.
