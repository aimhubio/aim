########
CatBoost
########


`AimCallback` for `CatBoost` is designed to enhance your experiment logging and monitoring. It thoroughly records essential information, including hyperparameters, training, validation, and test time metrics like loss and accuracy. Moreover, it offers comprehensive system usage tracking, keeping an eye on CPU and GPU memory utilization.

It only takes two steps to integrate Aim with `CatBoost <https://catboost.ai/>`_.

Step 1: Import `AimLogger` to track the training metadata.

.. code-block:: python

    # call SDK aim.catboost 
    from aimstack.catboost_tracker.loggers import BaseLogger as AimLogger

Step 2: Pass the logger to the trainer.

Trainings in CatBoost are initiated with `fit` method. 
The method can be supplied with `log_cout` parameter to redirect output logs into a custom handler.
Pass `AimLogger` to automatically track metrics and hyper-parameters with Aim.
Depending on the training log output, an additional argument `logging_level` could be passed to make Catboost yield more logs to track `test` & `best` values.

.. code-block:: python

    model.fit(train_data, train_labels, log_cout=AimLogger(loss_function='Logloss'), logging_level='Info')

`AimLogger` also accepts `log_cout` parameter to preserve the default functionality of Catboost's log handling.
You can pass your own handler, else it defaults to `sys.stdout`.

See `AimLogger` source `here <https://github.com/aimhubio/aim/blob/main/pkgs/aimstack/catboost_tracker/callbacks/base_callback.py>`_.
Check out a simple example `here <https://github.com/aimhubio/aim/blob/main/examples/catboost_track.py>`_.
