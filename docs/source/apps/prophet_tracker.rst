#######
Prophet
#######


`AimCallback` for `Prophet` is designed to enhance your experiment logging and monitoring. It thoroughly records essential information, including hyperparameters, training, validation, and test time metrics like loss and accuracy. Moreover, it offers comprehensive system usage tracking, keeping an eye on CPU and GPU memory utilization.

Aim provides an AimLogger object designed to track `Prophet <https://facebook.github.io/prophet/docs/quick_start.html>`_ hyperparameters and metrics.
It takes three steps to integrate Aim into your Prophet script.

Step 1: Explicitly import the `AimLogger`.

.. code-block:: python

    from aimstack.prophet_tracker.loggers import BaseLogger as AimLogger

Step 2: After initializing a Prophet model, instantiate the AimLogger with your Prophet model.

.. code-block:: python

    model = Prophet()
    logger = AimLogger(prophet_model=model, experiment="test_experiment")

Step 3 (optional): pass any metrics you want after fitting the Prophet model.

.. code-block:: python

    metrics = {"backtest_mse": backtest_mse, "backtest_mape": backtest_mape}
    logger.track_metrics(metrics)

Note that the metrics are assumed to be validation metrics by default. Alternatively, you can pass a `context` argument to the `track_metrics` method. 

.. code-block:: python

    metrics = {"train_mse": backtest_mse, "train_mape": backtest_mape}
    logger.track_metrics(metrics, context={"subset": "train"})

See `AimLogger` source `here <https://github.com/aimhubio/aim/blob/main/pkgs/aimstack/prophet_tracker/callbacks/base_callback.py>`_.
Check out a simple example `here <https://github.com/aimhubio/aim/blob/main/examples/prophet_track.py>`_.
