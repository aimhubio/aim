######
Optuna
######


`AimCallback` for `Optuna` is designed to enhance your experiment logging and monitoring. It thoroughly records essential information, including hyperparameters, training, validation, and test time metrics like loss and accuracy. Moreover, it offers comprehensive system usage tracking, keeping an eye on CPU and GPU memory utilization.

Aim provides a callback designed to automatically track `Optuna <https://optuna.org/>`_ trainings.
The `as_multirun` is a boolean argument. If `as_multirun` is set True then the callback will create a run for each trial. Otherwise it will track all of the results in a single run.
One can also use the decorator function `track_in_aim` to log inside the objective function.

Step 1: Explicitly import the `AimCallback` for tracking training metadata.

.. code-block:: python

    from aimstack.experiment_tracker.optuna import Callback as AimCallback

Step 2: Pass the callback to `cbs` list upon initiating your training.

.. code-block:: python

    aim_callback = AimCallback(experiment_name="test_experiment")
    study.optimize(objective, n_trials=10, callbacks=[aim_callback])

See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/pkgs/aimstack/optuna_tracker/callbacks/base_callback.py>`_.
Check out a simple example `here <https://github.com/aimhubio/aim/blob/main/examples/optuna_track.py>`_.
