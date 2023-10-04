#####
MXNet
#####


`AimCallback` for `MXNet` is designed to enhance your experiment logging and monitoring. It thoroughly records essential information, including hyperparameters, training, validation, and test time metrics like loss and accuracy. Moreover, it offers comprehensive system usage tracking, keeping an eye on CPU and GPU memory utilization.

To track MXNet experiments use Aim callback designed for `MXNet <https://mxnet.apache.org/>`_ fit method.
It takes two steps to integrate Aim into your training script.

Step 1: Import the `AimLoggingHandler` for tracking training metadata.

.. code-block:: python

    from aimstack.mxnet_tracker.loggers import LoggingHandler as AimLoggingHandler

Step 2: Pass a callback instance to `event_handlers` list upon initiating your training.

.. code-block:: python

    aim_log_handler = AimLoggingHandler(experiment_name="test_experiment",
                                        log_interval=1, metrics=[train_acc, train_loss, val_acc])

    est.fit(train_data=train_data_loader, val_data=val_data_loader,
            epochs=num_epochs, event_handlers=[aim_log_handler])

See `AimLoggingHandler` source `here <https://github.com/aimhubio/aim/blob/main/pkgs/aimstack/mxnet_tracker/callbacks/base_callback.py>`_.
Check out a simple example `here <https://github.com/aimhubio/aim/blob/main/examples/mxnet_track.py>`_.
