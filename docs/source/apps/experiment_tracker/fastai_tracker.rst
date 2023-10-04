######
Fastai
######

`AimCallback` for `Fastai` is designed to enhance your experiment logging and monitoring. It thoroughly records essential information, including hyperparameters, training, validation, and test time metrics like loss and accuracy. Moreover, it offers comprehensive system usage tracking, keeping an eye on CPU and GPU memory utilization.

Aim comes with a built-in callback designed to automatically track `fastai <https://docs.fast.ai/>`_ trainings.
It takes two steps to integrate Aim into your training script.

Step 1: Explicitly import the `AimCallback` for tracking training metadata.

.. code-block:: python

    from aimstack.experiment_tracker.fastai import Callback as AimCallback

Step 2: Pass the callback to `cbs` list upon initiating your training.

.. code-block:: python

    learn = cnn_learner(dls, resnet18, pretrained=True,
                        loss_func=CrossEntropyLossFlat(),
                        metrics=accuracy, model_dir="/tmp/model/",
                        cbs=AimCallback(experiment="test_experiment"))

See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/pkgs/aimstack/fastai_tracker/callbacks/base_callback.py>`_.
Check out a simple example `here <https://github.com/aimhubio/aim/blob/main/examples/fastai_track.py>`_.
