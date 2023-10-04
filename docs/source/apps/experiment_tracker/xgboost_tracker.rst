#######
XGboost
#######


`AimCallback` for `XGboost` is designed to enhance your experiment logging and monitoring. It thoroughly records essential information, including hyperparameters, training, validation, and test time metrics like loss and accuracy. Moreover, it offers comprehensive system usage tracking, keeping an eye on CPU and GPU memory utilization.

Enjoy using aim to track XGBoost experimental data which requires two simple steps:

Step 1: Explicitly import the `AimCallback` for tracking training data.

.. code-block:: python

    from aimstack.experiment_tracker.xgboost import Callback as AimCallback

Step 2: XGBoost provides the `xgboost.train` method for model training, in which the callbacks parameter can call back data information from the outside. Here we pass in AimCallback designed for tracking data information

.. code-block:: python

    xgboost.train(param, dtrain, num_round, watchlist,
                                callbacks=[AimCallback(experiment="test_experiment")])

See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/pkgs/aimstack/xgboost_tracker/callbacks/base_callback.py>`_.
Check out a simple example `here <https://github.com/aimhubio/aim/blob/main/examples/xgboost_track.py>`_.
