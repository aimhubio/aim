Pytorch Ignite
==============

.. image:: https://colab.research.google.com/assets/colab-badge.svg
   :target: https://colab.research.google.com/github/aimhubio/tutorials/blob/publication/notebooks/pytorch_ignite_track.ipynb

It only takes 2 steps to inject Aim into PyTorch Ignite:

.. code-block:: python

    # import aim pytorch ignite app
    from aim.ml.pytorch_ignite import AimLogger

PyTorch Ignite provides trainer objects to simplify the training process of PyTorch models. We can attach the trainer object as AimLogger's output handler to use the logger function defined by Aim to simplify the process of tracking experiments. This process is divided into 2 steps:

Step 1. Create `AimLogger` object

.. code-block:: python

    aim_logger = AimLogger(
        experiment='aim_on_pt_ignite',
        train_metric_prefix='train_',
        val_metric_prefix='val_',
        test_metric_prefix='test_',
    )

Step 2. Attach output handler to the `aim_logger` object

.. code-block:: python

    aim_logger.attach_output_handler(
        trainer,
        event_name=Events.ITERATION_COMPLETED,
        tag="train",
        output_transform=lambda loss: {'loss': loss}
    )

Adapter source can be found `here <https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/pytorch_ignite.py>`_.
Example using PyTorch Ignite can be found `here <https://github.com/aimhubio/aim/blob/main/examples/pytorch_ignite_track.py>`_.

Pytorch Lightning
=================

<!--![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1Kq3-6x0dd7gAVCsiaClJf1TfKnW-d64f?usp=sharing) 

The work is designed to build an image classifier to solve a famous real-world problem ——handwritten digit recognition. In this work, we will introduce how to introduce aim logger to manage output information.-->

We only require 2 steps to simply and easily inject Aim into PyTorch Lightning:

.. code-block:: python

    # import aim sdk designed for pl
    from aim.pytorch_lightning import AimLogger

PyTorch Lightning provides trainer objects to simplify the training process of PyTorch models. One of the parameters is called logger. We can use the logger function defined by Aim to simplify the process of tracking experiments. This process is divided into 2 steps:

Step 1. Create `AimLogger` object

.. code-block:: python

    # track experimental data by using Aim
    aim_logger = AimLogger(
        experiment='aim_on_pt_lightning',
        train_metric_prefix='train_',
        val_metric_prefix='val_',
    )

Step 2. Pass the `aim_logger` object as the `logger` argument

.. code-block:: python

    # track experimental data by using Aim
    trainer = Trainer(gpus=1, progress_bar_refresh_rate=20, max_epochs=5, logger=aim_logger)

Adapter source can be found `here <https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/pytorch_lightning.py>`_.
Example using PyTorch Lightning can be found `here <https://github.com/aimhubio/aim/blob/main/examples/pytorch_lightning_track.py>`_.

Hugging Face
============

<!--![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1YJsWXmpmJ8s6K9smqIFT7CnM27yjoPq3?usp=sharing)-->

<!--In this guide, we will show you how to integrate Aim with Huggingface. The work we are going to do together is a sentiment classification problem, which is the most common text classification task. We choose the IMDB movie review dataset as an experimental dataset, which classifies movie reviews as positive or negative. During the training process, we will show the use of aim to record effective information.-->

You only need 2 simple steps to employ Aim to collect data ❤️

Step 1: Import the SDK designed by Aim for Huggingface.

.. code-block:: python

    from aim.hugging_face import AimCallback

Step 2: Hugging Face has a trainer API to help us simplify the training process. This API provides a callback function to return the information that the user needs. Therefore, aim has specially designed SDK to simplify the process of the user writing callback functions, we only need to initialize `AimCallback` object as follows:

.. code-block:: python

    # Initialize aim_callback
    aim_callback = AimCallback(experiment='huggingface_experiment')
    # Initialize trainer
    trainer = Trainer(
        model=model,    
        args=training_args,
        train_dataset=small_train_dataset,
        eval_dataset=small_eval_dataset,
        compute_metrics=compute_metrics,
        callbacks=[aim_callback]
    )

Adapter source can be found `here <https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/hugging_face.py>`_.
Example using Hugging Face can be found `here <https://github.com/aimhubio/aim/blob/main/examples/hugging_face_track.py>`_.

Integration with Keras & tf.Keras
=================================

<!--![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/18V8OTQ9RtLEit_yjAZAtUY1jXQmfQ0RN?usp=sharing)-->

<!--This tutorial leverages the well-known handwritten digit recognition task to describe how to integrate Aim with Keras & tf.Keras to train a digital image classification model based on the mnist dataset.-->

It only takes 2 steps to easily integrate aim in Keras to record experimental information.

.. code-block:: python

    # call Keras as the high API of TensorFlow 
    from aim.tensorflow import AimCallback
    # call Keras library directly
    from aim.keras import AimCallback

In Keras, we call the `fit()` method of the model object to train the data. The callbacks are provided here. `AimCallback` inherits the usage specification of callbacks. We just need to add it to the callbacks list.

.. code-block:: python

    model.fit(x_train, y_train, epochs=5, callbacks=[
              # in case of tf.keras, we use aim.tensorflow.AimCallback 
              AimCallback(experiment='aim_on_keras')                                      
    ])

Adapter source can be found `here <https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/tensorflow.py>`_.
Example using Keras can be found `here <https://github.com/aimhubio/aim/blob/main/examples/keras_track.py>`_.
Example using tf.Keras can be found `here <https://github.com/aimhubio/aim/blob/main/examples/tensorflow_keras_track.py>`_.

Integration with Keras Tuner
============================

It only takes 2 steps to easily integrate aim in Keras to record experimental information.

.. code-block:: python

    from aim.keras_tuner import AimCallback

In KerasTuner, we call the `search()` method of the tuner object to perform a search for the best hyperparameter configurations. The callbacks are provided here. `AimCallback` inherits the usage specification of callbacks. We just need to add it to the callbacks list.

.. code-block:: python

    tuner.search(
        train_ds,
        validation_data=test_ds,
        callbacks=[AimCallback(tuner=tuner, repo='./aim_logs', experiment='keras_tuner_test')],
    )

Adapter source can be found `here <https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/keras_tuner.py>`_.
Example using Keras Tuner can be found `here <https://github.com/aimhubio/aim/blob/main/examples/keras_tuner_track.py>`_.

Integration with XGboost
========================

<!--In the real world, there is a well-known handwritten digit recognition problem. In this article, we use the machine learning framework xgboost to help us train an image classification model. In this process, we will use Aim to track our experimental data.-->

Enjoy using aim to track XGBoost experimental data which requires two simple steps:

Step 1: Explicitly import the `AimCallback` for tracking training data.

.. code-block:: python

    # call SDK aim.xgboost 
    from aim.xgboost import AimCallback

Step 2: XGBoost provides the `xgboost.train` method for model training, in which the callbacks parameter can call back data information from the outside. Here we pass in AimCallback designed for tracking data information

.. code-block:: python

    xgboost.train(param, dtrain, num_round, watchlist,
                                callbacks=[AimCallback(experiment='xgboost_test')])

Adapter source can be found `here <https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/xgboost.py>`_.
Example using XGBoost can be found `here <https://github.com/aimhubio/aim/blob/main/examples/xgboost_track.py>`_.

Integration with CatBoost
=========================

It only takes two steps to integrate Aim with `CatBoost <https://catboost.ai/>`_.

Step 1: Import `AimLogger` to track the training metadata.

.. code-block:: python

    # call SDK aim.catboost 
    from aim.catboost import AimLogger

Step 2: Pass the logger to the trainer.

Trainings in CatBoost are initiated with `fit` method. 
The method can be supplied with `log_cout` parameter to redirect output logs into a custom handler.
Pass `AimLogger` to automatically track metrics and hyper-parameters with Aim.
Depending on the training log output, an additional argument `logging_level` could be passed to make Catboost yield more logs to track `test` & `best` values.

.. code-block:: python

    model.fit(train_data, train_labels, log_cout=AimLogger(loss_function='Logloss'), logging_level='Info')

`AimLogger` also accepts `log_cout` parameter to preserve the default functionality of Catboost's log handling.
You can pass your own handler, else it defaults to `sys.stdout`.

See `AimLogger` source `here <https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/catboost.py>`_.
Check out a simple example with Aim and CatBoost `here <https://github.com/aimhubio/aim/blob/main/examples/catboost_track.py>`_.

Integration with LightGBM
=========================

Aim comes with a built-in callback designed to automatically track `LightGBM <https://lightgbm.readthedocs.io/en/latest/index.html>`_ trainings.
It takes two steps to integrate Aim into your training script.

Step 1: Explicitly import the `AimCallback` for tracking training metadata.

.. code-block:: python

    from aim.lightgbm import AimCallback

Step 2: Pass the callback to `callbacks` list upon initiating your training.

.. code-block:: python

    gbm = lgb.train(params,
                    lgb_train,
                    num_boost_round=20,
                    valid_sets=lgb_eval,
                    callbacks=[AimCallback(experiment='lgb_test')])

While your training is running you can start `aim up` in another terminal session and observe the information in real time.

See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/lightgbm.py>`_.
Check out a simple regression task example `here <https://github.com/aimhubio/aim/blob/main/examples/lightgbm_track.py>`_.

Integration with fastai
=======================

Aim comes with a built-in callback designed to automatically track `fastai <https://docs.fast.ai/>`_ trainings.
It takes two steps to integrate Aim into your training script.

Step 1: Explicitly import the `AimCallback` for tracking training metadata.

.. code-block:: python

    from aim.fastai import AimCallback

Step 2: Pass the callback to `cbs` list upon initiating your training.

.. code-block:: python

    learn = cnn_learner(dls, resnet18, pretrained=True,
                        loss_func=CrossEntropyLossFlat(),
                        metrics=accuracy, model_dir="/tmp/model/",
                        cbs=AimCallback(repo='.', experiment='fastai_example'))

See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/fastai.py>`_.
Check out a simple regression task example `here <https://github.com/aimhubio/aim/blob/main/examples/fastai_track.py>`_.

Integration with MXNet
======================

To track MXNet experiments use Aim callback designed for `MXNet <https://mxnet.apache.org/>`_ fit method.
It takes two steps to integrate Aim into your training script.

Step 1: Import the `AimLoggingHandler` for tracking training metadata.

.. code-block:: python

    from aim.mxnet import AimLoggingHandler

Step 2: Pass a callback instance to `event_handlers` list upon initiating your training.

.. code-block:: python

    aim_log_handler = AimLoggingHandler(repo='.', experiment_name='mxnet_example',
                                        log_interval=1, metrics=[train_acc, train_loss, val_acc])

    est.fit(train_data=train_data_loader, val_data=val_data_loader,
            epochs=num_epochs, event_handlers=[aim_log_handler])

See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/mxnet.py>`_.
Check out a simple regression task example `here <https://github.com/aimhubio/aim/blob/main/examples/mxnet_track.py>`_.

Integration with Optuna
=======================

Aim provides a callback designed to automatically track `Optuna <https://optuna.org/>`_ trainings.
The `as_multirun` is a boolean argument. If `as_multirun` is set True then the callback will create a run for each trial. Otherwise it will track all of the results in a single run.
One can also use the decorator function `track_in_aim` to log inside the objective function.

Step 1: Explicitly import the `AimCallback` for tracking training metadata.

.. code-block:: python

    from aim.optuna import AimCallback

Step 2: Pass the callback to `cbs` list upon initiating your training.

.. code-block:: python

    aim_callback = AimCallback(experiment_name="optuna_single_run")
    study.optimize(objective, n_trials=10, callbacks=[aim_callback])

See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/optuna.py>`_.
Check out a simple objective optimization example `here <https://github.com/aimhubio/aim/blob/main/examples/optuna_track.py>`_.

Integration with PaddlePaddle
=============================

Aim provides a built-in callback to easily track `PaddlePaddle <https://www.paddlepaddle.org.cn/en>`_ trainings.
It takes two steps to integrate Aim into your training script.

Step 1: Explicitly import the `AimCallback` for tracking training metadata.

.. code-block:: python

    from aim.paddle import AimCallback

Step 2: Pass the callback to `callbacks` list upon initiating your training.

.. code-block:: python

    callback = AimCallback(repo='.', experiment='paddle_test')
    model.fit(train_dataset, eval_dataset, batch_size=64, callbacks=callback)

See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/paddle.py>`_.
Check out a simple objective optimization example `here <https://github.com/aimhubio/aim/blob/main/examples/paddle_track.py>`_.

Integration with Stable-Baselines3
==================================

Aim provides a callback to easily track one of the reliable Reinforcement Learning implementations `Stable-Baselines3 <https://stable-baselines3.readthedocs.io/en/master/>`_ trainings.
It takes two steps to integrate Aim into your training script.

Step 1: Explicitly import the `AimCallback` for tracking training metadata.

.. code-block:: python

    from aim.sb3 import AimCallback

Step 2: Pass the callback to `callback` upon initiating your training.

.. code-block:: python

    model.learn(total_timesteps=10_000, callback=AimCallback(repo='.', experiment_name='sb3_test'))

See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/sb3.py>`_.
Check out a simple objective optimization example `here <https://github.com/aimhubio/aim/blob/main/examples/sb3_track.py>`_.

Integration with Acme
=====================

Aim provides a built-in callback to easily track `Acme <https://dm-acme.readthedocs.io/en/latest/>`_ trainings.
It takes few simple steps to integrate Aim into your training script.

Step 1: Explicitly import the `AimCallback` and `AimWriter` for tracking training metadata.

.. code-block:: python

    from aim.sdk.acme import AimCallback, AimWriter

Step 2: Initialize an Aim Run via `AimCallback`, and create a log factory using the Run.

.. code-block:: python

    aim_run = AimCallback(repo=".", experiment_name="acme_test")
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
  
See `AimCallback` source `here <https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/acme.py>`_.
Check out a simple objective optimization example `here <https://github.com/aimhubio/aim/blob/main/examples/acme_track.py>`_.

Integration with Prophet
========================

Aim provides an AimLogger object designed to track `Prophet <https://facebook.github.io/prophet/docs/quick_start.html>`_ hyperparameters and metrics.
It takes three steps to integrate Aim into your Prophet script.

Step 1: Explicitly import the `AimLogger`.

.. code-block:: python

    from aim.prophet import AimLogger

Step 2: After initializing a Prophet model, instantiate the AimLogger with your Prophet model.

.. code-block:: python

    model = Prophet()
    logger = AimLogger(prophet_model=model, repo=".", experiment="prophet_test")

Step 3 (optional): pass any metrics you want after fitting the Prophet model.

.. code-block:: python

    metrics = {"backtest_mse": backtest_mse, "backtest_mape": backtest_mape}
    logger.track_metrics(metrics)

Note that the metrics are assumed to be validation metrics by default. Alternatively, you can pass a `context` argument to the `track_metrics` method. 

.. code-block:: python

    metrics = {"train_mse": backtest_mse, "train_mape": backtest_mape}
    logger.track_metrics(metrics, context={"subset": "train"})

See `AimLogger` source `here <https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/prophet.py>`_.
Check out a simple example `here <https://github.com/aimhubio/aim/blob/main/examples/prophet_track.py>`_.
