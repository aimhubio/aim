#################
Stable-Baselines3
#################


`AimCallback` for `Stable-Baselines3` is designed to enhance your experiment logging and monitoring. It thoroughly records essential information, including hyperparameters, training, validation, and test time metrics like loss and accuracy. Moreover, it offers comprehensive system usage tracking, keeping an eye on CPU and GPU memory utilization.

Aim provides a callback to easily track one of the reliable Reinforcement Learning implementations `Stable-Baselines3 <https://stable-baselines3.readthedocs.io/en/master/>`_ trainings.
It takes two steps to integrate Aim into your training script.

Step 1: Explicitly import the `AimCallback` for tracking training metadata.

.. code-block:: python

    from aimstack.experiment_tracker.sb3 import Callback as AimCallback

Step 2: Pass the callback to `callback` upon initiating your training.

.. code-block:: python

    model.learn(total_timesteps=10_000, callback=AimCallback(experiment_name="test_experiment"))

See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/pkgs/aimstack/sb3_tracker/callbacks/base_callback.py>`_.
Check out a simple example `here <https://github.com/aimhubio/aim/blob/main/examples/sb3_track.py>`_.
