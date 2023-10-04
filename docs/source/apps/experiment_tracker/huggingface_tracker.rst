############
Hugging Face
############


`AimCallback` for `Hugging Face` is designed to enhance your experiment logging and monitoring. It thoroughly records essential information, including hyperparameters, training, validation, and test time metrics like loss and accuracy. Moreover, it offers comprehensive system usage tracking, keeping an eye on CPU and GPU memory utilization.

In this guide, we will show you how to integrate Aim with Huggingface. The work we are going to do together is a sentiment classification problem, which is the most common text classification task. We choose the IMDB movie review dataset as an experimental dataset, which classifies movie reviews as positive or negative. During the training process, we will show the use of aim to record effective information.

You only need 2 simple steps to employ Aim to collect data ❤️

Step 1: Import the SDK designed by Aim for Huggingface.

.. code-block:: python

    from aimstack.experiment_tracker.hugging_face import Callback as AimCallback

Step 2: Hugging Face has a trainer API to help us simplify the training process. This API provides a callback function to return the information that the user needs. Therefore, aim has specially designed SDK to simplify the process of the user writing callback functions, we only need to initialize `AimCallback` object as follows:

.. code-block:: python

    # Initialize aim_callback
    aim_callback = AimCallback(experiment="test_experiment")
    # Initialize trainer
    trainer = Trainer(
        model=model,    
        args=training_args,
        train_dataset=small_train_dataset,
        eval_dataset=small_eval_dataset,
        compute_metrics=compute_metrics,
        callbacks=[aim_callback]
    )

See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/pkgs/aimstack/hugging_face_tracker/callbacks/base_callback.py>`_.
Check out a simple example `here <https://github.com/aimhubio/aim/blob/main/examples/hugging_face_track.py>`_.
