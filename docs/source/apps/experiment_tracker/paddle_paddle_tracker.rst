############
PaddlePaddle
############


`AimCallback` for `PaddlePaddle` is designed to enhance your experiment logging and monitoring. It thoroughly records essential information, including hyperparameters, training, validation, and test time metrics like loss and accuracy. Moreover, it offers comprehensive system usage tracking, keeping an eye on CPU and GPU memory utilization.

Aim provides a built-in callback to easily track `PaddlePaddle <https://www.paddlepaddle.org.cn/en>`_ trainings.
It takes two steps to integrate Aim into your training script.

Step 1: Explicitly import the `AimCallback` for tracking training metadata.

.. code-block:: python

    from aimstack.paddle_tracker.callbacks import BaseCallback as AimCallback

Step 2: Pass the callback to `callbacks` list upon initiating your training.

.. code-block:: python

    callback = AimCallback(experiment="test_experiment")
    model.fit(train_dataset, eval_dataset, batch_size=64, callbacks=callback)

See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/pkgs/aimstack/paddle_tracker/callbacks/base_callback.py>`_.
Check out a simple example `here <https://github.com/aimhubio/aim/blob/main/examples/paddle_track.py>`_.
