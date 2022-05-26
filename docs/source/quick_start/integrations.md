## Integrate Aim into an existing project

### Any python script

```python
from aim import Run

run = Run()

# Save inputs, hparams or any other `key: value` pairs
run['hparams'] = {
    'learning_rate': 0.001,
    'batch_size': 32,
}

# ...
for step in range(10):
    # Log metrics to visualize performance
    run.track(step, name='metric_name')
# ...
```

Aim easily integrates with your favourite ML frameworks.

Aim loggers give access to the `aim.Run` object instance via the `experiment` property. The `aim.Run` instance will help you to easily track additional metrics or set any other `key: value` pairs (params) relevant to your project.

In this way you can easily extend the default integrations. More info about this is abailable on Integration guides [section.](../using/integration_guides.html) 

### Integration with Pytorch Ignite
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/aimhubio/tutorials/blob/publication/notebooks/pytorch_ignite_track.ipynb)  


It only takes 2 steps to simply and easily inject Aim into pytorch ignite:

```python
# import aim sdk designed for pytorch ignite
from aim.pytorch_ignite import AimLogger
```
Pytorch Ignite provides trainer objects to simplify the training process of pytorch model. We can attach the trainer object as AimLogger's output handler to use the logger function defined by aim to simplify the process of tracking experiments. This process is divided into 2 steps:

Step 1. Create `AimLogger` object

```python
aim_logger = AimLogger(
    experiment='aim_on_pt_ignite',
    train_metric_prefix='train_',
    val_metric_prefix='val_',
    test_metric_prefix='test_',
)
```

Step 2. Attach output handler to the `aim_logger` object


```python
aim_logger.attach_output_handler(
    trainer,
    event_name=Events.ITERATION_COMPLETED,
    tag="train",
    output_transform=lambda loss: {'loss': loss}
)
```

Adapter source can be found [here](https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/pytorch_ignite.py).  
Example using Pytorch Ignite can be found [here](https://github.com/aimhubio/aim/blob/main/examples/pytorch_ignite_track.py).

### Integration with Pytorch Lightning

<!--[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1Kq3-6x0dd7gAVCsiaClJf1TfKnW-d64f?usp=sharing)--> 

<!--The work is designed to build an image classifier to solve a famous real world problem ——handwritten digit recognition. In this work, we will introduce how to introduce aim logger to manage output information. -->

We only require 2 steps to simply and easily inject Aim into pytorch lightining:

```python
# import aim sdk designed for pl
from aim.pytorch_lightning import AimLogger
```

Pytorch lighting provides trainer objects to simplify the training process of pytorch model. One of the parameters is called logger. We can use the logger function defined by aim to simplify the process of tracking experiments. This process is divided into 2 steps:

Step 1. Create `AimLogger` object

```python
# track experimental data by using Aim
aim_logger = AimLogger(
    experiment='aim_on_pt_lightning',
    train_metric_prefix='train_',
    val_metric_prefix='val_',
)
```

Step 2. Pass the `aim_logger` object as the `logger` argument


```python
# track experimental data by using Aim
trainer = Trainer(gpus=1, progress_bar_refresh_rate=20, max_epochs=5, logger=aim_logger)
```
Adapter source can be found [here](https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/pytorch_lightning.py).  
Example using Pytorch Lightning can be found [here](https://github.com/aimhubio/aim/blob/main/examples/pytorch_lightning_track.py).


### Integration with Hugging Face

<!--[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1YJsWXmpmJ8s6K9smqIFT7CnM27yjoPq3?usp=sharing)-->

<!--In this guide, we will show you how to integrate Aim with Huggingface. The work we are going to do together is sentiment classification problem, which is the most common text classification task. We choose the IMDB movie review dataset as an experimental dataset, which classifies movie reviews as positive or negative. During the training process, we will show the use of aim to record effective information.-->

You only need 2 simple steps to employ Aim to collect data ❤️

Step 1: Import the sdk designed by Aim for Huggingface.

```python
from aim.hugging_face import AimCallback
```

Step 2: Hugging Face has a trainer api to help us simplify the training process. This api provides a callback function to return the information that the user needs. Therefore, aim has specially designed SDK to simplify the process of the user writing callback functions, we only need to initialize `AimCallback` object as follows:

```python
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
```
Adapter source can be found [here](https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/hugging_face.py).  
Example using Hugging Face can be found [here](https://github.com/aimhubio/aim/blob/main/examples/hugging_face_track.py).


### Integration with Keras & tf.Keras

<!--[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/18V8OTQ9RtLEit_yjAZAtUY1jXQmfQ0RN?usp=sharing)-->

<!--This tutorial leverages the well-known handwritten digit recognition task to describe how to integrate Aim with Keras & tf.Keras to train a digital image classification model based on the mnist dataset.--> 

It only takes 2 steps to easily integrate aim in keras to record experimental information.

```python
# call keras as the high api of tensorflow 
from aim.tensorflow import AimCallback
# call keras library directly
from aim.keras import AimCallback
```

In keras, we call the `fit()` method of the model object to train the data. The callbacks are provided here. `AimCallback` inherits the usage specification of callbacks. We just need to add it to the callbacks list.

```python
model.fit(x_train, y_train, epochs=5, callbacks=[
          # in case of tf.keras, we use aim.tensorflow.AimCallback 
          AimCallback(experiment='aim_on_keras')                                      
])
```

Adapter source can be found [here](https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/tensorflow.py).  
Example using Keras can be found [here](https://github.com/aimhubio/aim/blob/main/examples/keras_track.py).  
Example using tf.Keras can be found [here](https://github.com/aimhubio/aim/blob/main/examples/tensorflow_keras_track.py).

### Integration with XGboost

<!--In the real world, there is a well-known handwritten digit recognition problem. In this article, we use the machine learning framework xgboost to help us train an image classification model. In this process, we will use Aim to track our experimental data.-->

Enjoy using aim to track xgboost experimental data which requires two simple steps:

Step 1: Explicitly import the `AimCallback` for tracking training data.

```python
# call sdk aim.xgboost 
from aim.xgboost import AimCallback
```

Step 2: XGboost provides the `xgboost.train` method for model training, in which the callbacks parameter can call back data information from the outside. Here we pass in aimcallbacl designed for tracking data information

```python
xgboost.train(param, dtrain, num_round, watchlist,
                            callbacks=[AimCallback(experiment='xgboost_test')])
```

Adapter source can be found [here](https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/xgboost.py).  
Example using XGboost can be found [here](https://github.com/aimhubio/aim/blob/main/examples/xgboost_track.py).

### Integration with CatBoost

It only takes two steps to integrate Aim with [CatBoost](https://catboost.ai/).

Step 1: Import `AimLogger` to track the training metadata.

```python
# call sdk aim.catboost 
from aim.catboost import AimLogger
```

Step 2: Pass the logger to the trainer.

Trainings in CatBoost are initiated with `fit` method. 
The method can be supplied with `log_cout` parameter to redirect output logs into a custom handler.
Pass `AimLogger` to automatically track metrics and hyper-parameters with Aim.
Depending on the training log output, an additional argument `logging_level` could be passed to make Catboost yield more logs to track `test` & `best` values.

```python
model.fit(train_data, train_labels, log_cout=AimLogger(loss_function='Logloss'), logging_level='Info')
```

`AimLogger` also accepts `log_cout` parameter to preserve the default functionality of Catboost's log handling.
You can pass your own handler, else it defaults to `sys.stdout`.

See `AimLogger` source [here](https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/catboost.py).  
Check out a simple example with Aim and CatBoost [here](https://github.com/aimhubio/aim/blob/main/examples/catboost_track.py).

### Integration with LightGBM

Aim comes with a builtin callback designed to automatically track [LightGBM](https://lightgbm.readthedocs.io/en/latest/index.html) trainings.
It takes two steps to integrate Aim into your training script.

Step 1: Explicitly import the `AimCallback` for tracking training metadata.

```python
from aim.lightgbm import AimCallback
```

Step 2: Pass the callback to `callbacks` list upon initiating your training.

```python
gbm = lgb.train(params,
                lgb_train,
                num_boost_round=20,
                valid_sets=lgb_eval,
                callbacks=[AimCallback(experiment='lgb_test')])
```

While your training is running you can start `aim up` in another terminal session and observe the information in real
time.

See `AimCallback` source [here](https://github.com/aimhubio/aim/blob/main/aim/sdk/adapters/lightgbm.py).  
Check out a simple regression task example [here](https://github.com/aimhubio/aim/blob/main/examples/lightgbm_track.py).

### What's next?

During the training process, you can start another terminal in the same directory, start `aim up` and you can observe
the information in real time.
