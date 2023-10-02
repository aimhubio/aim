###################
Acme
###################

`AimCallback` for `Acme` is designed to enhance your experiment logging and monitoring. It thoroughly records essential information, including hyperparameters, training, validation, and test time metrics like loss and accuracy. Moreover, it offers comprehensive system usage tracking, keeping an eye on CPU and GPU memory utilization.

Aim provides a built-in callback to easily track `Acme <https://dm-acme.readthedocs.io/en/latest/>`_ trainings.
It takes few simple steps to integrate Aim into your training script.


Step 1: Explicitly import the `AimCallback` and `AimWriter` for tracking training metadata.

.. code-block:: python

    from aimstack.acme_tracker.callbacks import BaseWriter as AimWriter, BaseCallback as AimCallback

Step 2: Initialize an Aim Run via `AimCallback`, and create a log factory using the Run.

.. code-block:: python

    aim_run = AimCallback(experiment_name="test_experiment")
    def logger_factory(
        name: str,
        steps_key: Optional[str] = None,
        task_id: Optional[int] = None,
    ) -> loggers.Logger:
        return AimWriter(aim_run, name, steps_key, task_id)

Step 3: Pass the logger factory to `logger_factory` upon initiating your training.

.. code-block:: python

    experiment_config = experiments.ExperimentConfig(
        builder=d4pg_builder,
        environment_factory=make_environment,
        network_factory=network_factory,
        logger_factory=logger_factory,
        seed=0,
        max_num_actor_steps=5000)
  
See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/pkgs/aimstack/acme_tracker/callbacks/base_callback.py>`_.
Check out a simple example `here <https://github.com/aimhubio/aim/blob/main/examples/acme_track.py>`_.
