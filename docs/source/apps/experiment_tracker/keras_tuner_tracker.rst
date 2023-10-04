###########
Keras Tuner
###########

`AimCallback` for `Keras Tuner` is designed to enhance your experiment logging and monitoring. It thoroughly records essential information, including hyperparameters, training, validation, and test time metrics like loss and accuracy. Moreover, it offers comprehensive system usage tracking, keeping an eye on CPU and GPU memory utilization.

It only takes 2 steps to easily integrate aim in Keras to record experimental information.

.. code-block:: python

    from aimstack.keras_tuner_tracker.callbacks import BaseCallback as AimCallback

In KerasTuner, we call the `search()` method of the tuner object to perform a search for the best hyperparameter configurations. The callbacks are provided here. `AimCallback` inherits the usage specification of callbacks. We just need to add it to the callbacks list.

.. code-block:: python

    tuner.search(
        train_ds,
        validation_data=test_ds,
        callbacks=[AimCallback(tuner=tuner, experiment="test_experiment")],
    )

See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/pkgs/aimstack/keras_tuner_tracker/callbacks/base_callback.py>`_.
Check out a simple example `here <https://github.com/aimhubio/aim/blob/main/examples/keras_tuner_track.py>`_.
