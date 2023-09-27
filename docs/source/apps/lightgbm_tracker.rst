########
LightGBM
########

`AimCallback` for `LightGBM` is designed to enhance your experiment logging and monitoring. It thoroughly records essential information, including hyperparameters, training, validation, and test time metrics like loss and accuracy. Moreover, it offers comprehensive system usage tracking, keeping an eye on CPU and GPU memory utilization.

Aim comes with a built-in callback designed to automatically track `LightGBM <https://lightgbm.readthedocs.io/en/latest/index.html>`_ trainings.
It takes two steps to integrate Aim into your training script.

Step 1: Explicitly import the `AimCallback` for tracking training metadata.

.. code-block:: python

    from aimstack.lightgbm_tracker.callbacks import BaseCallback as AimCallback

Step 2: Pass the callback to `callbacks` list upon initiating your training.

.. code-block:: python

    gbm = lgb.train(params,
                    lgb_train,
                    num_boost_round=20,
                    valid_sets=lgb_eval,
                    callbacks=[AimCallback(experiment="test_experiment")])

While your training is running you can start `aim up` in another terminal session and observe the information in real time.

See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/pkgs/aimstack/lightgbm_tracker/callbacks/base_callback.py>`_.
Check out a simple example `here <https://github.com/aimhubio/aim/blob/main/examples/lightgbm_track.py>`_.
