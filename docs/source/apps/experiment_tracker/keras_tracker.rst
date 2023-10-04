################
Keras & tf.Keras
################

`AimCallback` for `Keras` is designed to enhance your experiment logging and monitoring. It thoroughly records essential information, including hyperparameters, training, validation, and test time metrics like loss and accuracy. Moreover, it offers comprehensive system usage tracking, keeping an eye on CPU and GPU memory utilization.

This tutorial leverages the well-known handwritten digit recognition task to describe how to integrate Aim with Keras & tf.Keras to train a digital image classification model based on the mnist dataset.

It only takes 2 steps to easily integrate aim in Keras to record experimental information.

.. code-block:: python

    from aimstack.keras_tracker.callbacks import BaseCallback as AimCallback


In Keras, we call the `fit()` method of the model object to train the data. The callbacks are provided here. `AimCallback` inherits the usage specification of callbacks. We just need to add it to the callbacks list.

.. code-block:: python

    model.fit(x_train, y_train, epochs=5, callbacks=[
              # in case of tf.keras, we use aim.tensorflow.AimCallback 
              AimCallback(experiment="test_experiment")                                      
    ])

See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/pkgs/aimstack/keras_tracker/callbacks/base_callback.py>`_.
Check out a simple example using Keras `here <https://github.com/aimhubio/aim/blob/main/examples/keras_track.py>`_.
Check out a simple example using tf.Keras `here <https://github.com/aimhubio/aim/blob/main/examples/tensorflow_keras_track.py>`_.
