##############
PyTorch Ignite
##############


`AimCallback` for `PyTorch Ignite` is designed to enhance your experiment logging and monitoring. It thoroughly records essential information, including hyperparameters, training, validation, and test time metrics like loss and accuracy. Moreover, it offers comprehensive system usage tracking, keeping an eye on CPU and GPU memory utilization.

It takes only 2 steps to inject Aim into PyTorch Ignite:

.. code-block:: python

    # import aimstack pytorch ignite app
    from aimstack.experiment_tracker.pytorch_ignite import Logger as AimLogger

PyTorch Ignite provides trainer objects to simplify the training process of PyTorch models. We can attach the trainer object as AimLogger's output handler to use the logger function defined by Aim to simplify the process of tracking experiments. This process is divided into 2 steps:

Step 1. Create `AimLogger` object

.. code-block:: python

    aim_logger = AimLogger(
        experiment="test_experiment",
        train_metric_prefix="train_",
        val_metric_prefix="val_",
        test_metric_prefix="test_",
    )

Step 2. Attach output handler to the `aim_logger` object

.. code-block:: python

    aim_logger.attach_output_handler(
        trainer,
        event_name=Events.ITERATION_COMPLETED,
        tag="train",
        output_transform=lambda loss: {'loss': loss}
    )

See `AimLogger` source `here <https://github.com/aimhubio/aim/blob/main/pkgs/aimstack/pytorch_ignite_tracker/callbacks/base_callback.py>`_.
Check out a simple example `here <https://github.com/aimhubio/aim/blob/main/examples/pytorch_ignite_track.py>`_.
