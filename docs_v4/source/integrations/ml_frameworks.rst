============================
 Machine Learning Frameworks
============================

Aim easily integrates with your favourite ML frameworks.

Aim loggers give access to the ``aim.Run`` object instance via the ``experiment`` property.
The ``aim.Run`` instance will help you to easily track additional metrics or set any other ``key: value`` pairs (params) relevant to your project.

In this way you can easily extend the default integrations.

Pytorch Ignite
--------------

It only takes 2 steps to simply and easily inject Aim into pytorch ignite:

.. code-block:: python

   # import aim sdk designed for pytorch ignite
   from aim.pytorch_ignite import AimLogger

Pytorch Ignite provides trainer objects to simplify the training process of pytorch model.
We can attach the trainer object as AimLogger's output handler to use the logger function defined by aim to simplify the process of tracking experiments.
This process is divided into 2 steps:

Step 1. Create ``AimLogger`` object

.. code-block:: python

   aim_logger = AimLogger(
       experiment='aim_on_pt_ignite',
       train_metric_prefix='train_',
       val_metric_prefix='val_',
       test_metric_prefix='test_',
   )

Step 2. Attach output handler to the ``aim_logger`` object

.. code-block:: python

   aim_logger.attach_output_handler(
       trainer,
       event_name=Events.ITERATION_COMPLETED,
       tag="train",
       output_transform=lambda loss: {'loss': loss}
   )

Example using Pytorch Ignite can be found `here <https://github.com/aimhubio/aim/blob/main/examples/pytorch_ignite_track.py>`_.


Pytorch Lightning
-----------------

We only require 2 steps to simply and easily inject Aim into pytorch lightining:

.. code-block:: python

   # import aim sdk designed for pl
   from aim.pytorch_lightning import AimLogger

Pytorch lighting provides trainer objects to simplify the training process of pytorch model. One of the parameters is called logger. We can use the logger function defined by aim to simplify the process of tracking experiments. This process is divided into 2 steps:

Step 1. Create ``AimLogger`` object

.. code-block:: python

   # track experimental data by using Aim
   aim_logger = AimLogger(
       experiment='aim_on_pt_lightning',
       train_metric_prefix='train_',
       val_metric_prefix='val_',
   )

Step 2. Pass the ``aim_logger`` object as the ``logger`` argument

.. code-block:: python

   # track experimental data by using Aim
   trainer = Trainer(gpus=1, progress_bar_refresh_rate=20, max_epochs=5, logger=aim_logger)

Example using Pytorch Lightning can be found `here <https://github.com/aimhubio/aim/blob/main/examples/pytorch_lightning_track.py>`_.


Hugging Face
------------

You only need 2 simple steps to employ Aim to collect data.

Step 1: Import the sdk designed by Aim for HuggingFace.

.. code-block:: python

   from aim.hugging_face import AimCallback

Step 2: Hugging Face has a trainer api to help us simplify the training process. This api provides a callback function to return the information that the user needs. Therefore, aim has specially designed SDK to simplify the process of the user writing callback functions, we only need to initialize ``AimCallback`` object as follows:

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

Example using Hugging Face can be found `here <https://github.com/aimhubio/aim/blob/main/examples/hugging_face_track.py>`_.


Keras & tf.Keras
----------------

It only takes 2 steps to easily integrate aim in keras to record experimental information.

.. code-block:: python

   # call keras as the high api of tensorflow
   from aim.tensorflow import AimCallback
   # call keras library directly
   from aim.keras import AimCallback

In keras, we call the ``fit()`` method of the model object to train the data. The callbacks are provided here. ``AimCallback`` inherits the usage specification of callbacks. We just need to add it to the callbacks list.

.. code-block:: python

   model.fit(x_train, y_train, epochs=5, callbacks=[
             # in case of tf.keras, we use aim.tensorflow.AimCallback
             AimCallback(experiment='aim_on_keras')
   ])


Example using Keras can be found `here <https://github.com/aimhubio/aim/blob/main/examples/keras_track.py>`_.
Example using tf.Keras can be found `here <https://github.com/aimhubio/aim/blob/main/examples/tensorflow_keras_track.py>`_.


Keras Tuner
-----------

It only takes 2 steps to easily integrate aim in keras to track experiments.

.. code-block:: python

    from aim.keras_tuner import AimCallback

In kerastuner, we call the ``search()`` method of the tuner object to perform a search for best hyperparameter configuations.
``AimCallback`` inherits the usage specification of callbacks. We just need to add it to the callbacks list.

.. code-block:: python

    tuner.search(
        train_ds,
        validation_data=test_ds,
        callbacks=[AimCallback(tuner=tuner, repo='./aim_logs', experiment='keras_tuner_test')],
    )

Example using Keras Tuner can be found `here <https://github.com/aimhubio/aim/blob/main/examples/keras_tuner_track.py>`_.

XGboost
-------

Enjoy using aim to track xgboost experimental data which requires two simple steps:

Step 1: Explicitly import the ``AimCallback`` for tracking training data.

.. code-block:: python

    # call sdk aim.xgboost
    from aim.xgboost import AimCallback

Step 2: XGboost provides the ``xgboost.train`` method for model training, in which the callbacks parameter can call back data information from the outside.
Here we pass in aimcallback designed for tracking metadata.

.. code-block:: python

    xgboost.train(param, dtrain, num_round, watchlist,
                            callbacks=[AimCallback(experiment='xgboost_test')])

Example using XGboost can be found `here <https://github.com/aimhubio/aim/blob/main/examples/xgboost_track.py>`_.

CatBoost
--------

It only takes two steps to integrate Aim with `CatBoost <https://catboost.ai/>`_.

Step 1: Import ``AimLogger`` to track the training metadata.

.. code-block:: python

    # call sdk aim.catboost
    from aim.catboost import AimLogger

Step 2: Pass the logger to the trainer.

Trainings in CatBoost are initiated with ``fit`` method.
The method can be supplied with ``log_cout`` parameter to redirect output logs into a custom handler.
Pass ``AimLogger`` to automatically track metrics and hyper-parameters with Aim.
Depending on the training log output, an additional argument ``logging_level`` could be passed to make Catboost yield more logs to track `test` & `best` values.

.. code-block:: python

    model.fit(train_data, train_labels, log_cout=AimLogger(loss_function='Logloss'), logging_level='Info')

``AimLogger`` also accepts ``log_cout`` parameter to preserve the default functionality of Catboost's log handling.
You can pass your own handler, else it defaults to ``sys.stdout``.

Check out a simple example with Aim and CatBoost `here <https://github.com/aimhubio/aim/blob/main/examples/catboost_track.py>`_.


LightGBM
--------

Aim comes with a builtin callback designed to automatically track `LightGBM <https://lightgbm.readthedocs.io/en/latest/index.html>`_ trainings.
It takes two steps to integrate Aim into your training script.

Step 1: Explicitly import the ``AimCallback`` for tracking training metadata.

.. code-block:: python

    from aim.lightgbm import AimCallback

Step 2: Pass the callback to ``callbacks`` list upon initiating your training.

.. code-block:: python

    gbm = lgb.train(params,
                    lgb_train,
                    num_boost_round=20,
                    valid_sets=lgb_eval,
                    callbacks=[AimCallback(experiment='lgb_test')])

While your training is running you can start ``aim up`` in another terminal session and observe the information in real
time.

Check out a simple regression task example `here <https://github.com/aimhubio/aim/blob/main/examples/lightgbm_track.py>`_.


fastai
------

Aim comes with a builtin callback designed to automatically track `fastai <https://docs.fast.ai/>`_ trainings.
It takes two steps to integrate Aim into your training script.

Step 1: Explicitly import the ``AimCallback`` for tracking training metadata.

.. code-block:: python

    from aim.fastai import AimCallback

Step 2: Pass the callback to ``cbs`` list upon initiating your training.

.. code-block:: python

    learn = cnn_learner(dls, resnet18, pretrained=True,
                        loss_func=CrossEntropyLossFlat(),
                        metrics=accuracy, model_dir="/tmp/model/",
                        cbs=AimCallback(repo='.', experiment='fastai_example'))

Check out a simple regression task example `here <https://github.com/aimhubio/aim/blob/main/examples/fastai_track.py>`_.


MXNet
-----

To track MXNet experiments use Aim callback designed for `MXNet <https://mxnet.apache.org/>`_ fit method.
It takes two steps to integrate Aim into your training script.

Step 1: Import the ``AimLoggingHandler`` for tracking training metadata.

.. code-block:: python

    from aim.mxnet import AimLoggingHandler

Step 2: Pass a callback instance to ``event_handlers`` list upon initiating your training.

.. code-block:: python

    aim_log_handler = AimLoggingHandler(repo='.', experiment_name='mxnet_example',
                                        log_interval=1, metrics=[train_acc, train_loss, val_acc])

    est.fit(train_data=train_data_loader, val_data=val_data_loader,
            epochs=num_epochs, event_handlers=[aim_log_handler])

Check out a simple regression task example `here <https://github.com/aimhubio/aim/blob/main/examples/mxnet_track.py>`_.


Optuna
------

Aim provides a callback designed to automatically track `optuna <https://optuna.org/>`_ trainings.
The ``as_multirun`` is a boolean argument. If ``as_multirun`` is set True then the callback will create a run for each trial.
Otherwise it will track all of the results in a single run.
One can also use the decorator function ``track_in_aim`` to log inside the objective function.

Step 1: Explicitly import the ``AimCallback`` for tracking training metadata.

.. code-block:: python

    from aim.optuna import AimCallback

Step 2: Pass the callback to ``cbs`` list upon initiating your training.

.. code-block:: python

    aim_callback = AimCallback(experiment_name="optuna_single_run")
    study.optimize(objective, n_trials=10, callbacks=[aim_callback])

Check out a simple objective optimization example `here <https://github.com/aimhubio/aim/blob/main/examples/optuna_track.py>`_.

PaddlePaddle
------------

Aim provides a built in callback to easily track `PaddlePaddle <https://www.paddlepaddle.org.cn/en>`_ trainings.
It takes two steps to integrate Aim into your training script.

Step 1: Explicitly import the ``AimCallback`` for tracking training metadata.

.. code-block:: python

    from aim.paddle import AimCallback

Step 2: Pass the callback to ``callbacks`` list upon initiating your training.

.. code-block:: python

    callback = AimCallback(repo='.', experiment='paddle_test')
    model.fit(train_dataset, eval_dataset, batch_size=64, callbacks=callback)

Check out a simple objective optimization example `here <https://github.com/aimhubio/aim/blob/main/examples/paddle_track.py>`_.

Stable-Baselines3
-----------------

Aim provides a callback to easily track one of the reliable Reinforcement Learning implementations `Stable-Baselines3 <https://stable-baselines3.readthedocs.io/en/master/>`_ trainings.
It takes two steps to integrate Aim into your training script.

Step 1: Explicitly import the ``AimCallback`` for tracking training metadata.

.. code-block:: python

    from aim.sb3 import AimCallback

Step 2: Pass the callback to ``callback`` upon initiating your training.

.. code-block:: python

    model.learn(total_timesteps=10_000, callback=AimCallback(repo='.', experiment_name='sb3_test'))

Check out a simple objective optimization example `here <https://github.com/aimhubio/aim/blob/main/examples/sb3_track.py>`_.


Acme
----

Aim provides a built in callback to easily track `Acme <https://dm-acme.readthedocs.io/en/latest/>`_ trainings.
It takes few simple steps to integrate Aim into your training script.

Step 1: Explicitly import the ``AimCallback`` and ``AimWriter`` for tracking training metadata.

.. code-block:: python

    from aim.sdk.acme import AimCallback, AimWriter

Step 2: Initialize an Aim Run via ``AimCallback``, and create a log factory using the Run.

.. code-block:: python

    aim_run = AimCallback(repo=".", experiment_name="acme_test")
    def logger_factory(
        name: str,
        steps_key: Optional[str] = None,
        task_id: Optional[int] = None,
    ) -> loggers.Logger:
        return AimWriter(aim_run, name, steps_key, task_id)

Step 3: Pass the logger factory to ``logger_factory`` upon initiating your training.

.. code-block:: python

    experiment_config = experiments.ExperimentConfig(
        builder=d4pg_builder,
        environment_factory=make_environment,
        network_factory=network_factory,
        logger_factory=logger_factory,
        seed=0,
        max_num_actor_steps=5000)

Check out a simple objective optimization example `here <https://github.com/aimhubio/aim/blob/main/examples/acme_track.py>`_.
