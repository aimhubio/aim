## Integrate with ML Frameworks


### Integration with Keras & tf.Keras

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/18V8OTQ9RtLEit_yjAZAtUY1jXQmfQ0RN?usp=sharing)

This tutorial leverages the well-known handwritten digit recognition task to describe how to integrate Aim with Keras & tf.Keras to train a digital image classification model based on the mnist dataset.

It only takes 2 steps to easily integrate aim in keras to record experimental information.

```python
# call keras as the high api of tensorflow 
from aim.tensorflow import AimCallback
# call keras library directly
from aim.keras import AimCallback
```

In keras, we call the fit method of the model object to train the data. The callbacks are provided here. AimCallback inherits the usage specification of callbacks. We just need to add it to the callbacks list.

```python
model.fit(x_train, y_train, epochs=5, callbacks=[
          # in case of tf.keras, we use aim.tensorflow.AimCallback 
          AimCallback(experiment='aim_on_keras')                                      
])
```

### Integration with Pytorch Lightning

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1Kq3-6x0dd7gAVCsiaClJf1TfKnW-d64f?usp=sharing)

The work is designed to build a image classifier to solve a famous real world problem ——handwritten digit recognition. In this work, we will introduce how to introduce aim logger to manage output information.

We only require 2 steps to simply and easily inject Aim into pytorch lightining:

```python
# call aim sdk designed for pl
from aim.pytorch_lightning import AimLogger
```

Pytorch lighting provides trainer objects to simplify the training process of pytorch model. One of the parameters is called logger. We can use the logger function defined by aim to simplify the process of tracking experiments. This process is divided into 2 steps:

Step 1.create AimLogger object

```python
# track experimential data by using Aim
aim_logger = AimLogger(
    experiment='aim_on_pt_lightning',
    train_metric_prefix='train_',
    val_metric_prefix='val_',
)
```

Step 2. Pass the aim_logger object to the logger variable


```python
# track experimential data by using Aim
trainer = Trainer(gpus=1, progress_bar_refresh_rate=20, max_epochs=5, logger=aim_logger)
```


## Integration with Pytorch Ignite



It only takes 2 steps to simply and easily inject Aim into pytorch ignite:

```python
# call aim sdk designed for pytorch ignite
from aim.pytorch_ignite import AimLogger
```

Pytorch Ignite provides trainer objects to simplify the training process of pytorch model. We can attach the trainer object as AimLogger's output handler to use the logger function defined by aim to simplify the process of tracking experiments. This process is divided into 2 steps:

Step 1.create AimLogger object

```python
# track experimential data by using Aim
aim_logger = AimLogger(
    experiment='aim_on_pt_ignite',
    train_metric_prefix='train_',
    val_metric_prefix='val_',
    test_metric_prefix='test_',
)
```

Step 2. Attach output handler to the aim_logger object


```python
# track experimential data by using Aim
aim_logger.attach_output_handler(
    train_evaluator,
    event_name=Events.EPOCH_COMPLETED,
    tag="train",
    metric_names=["nll", "accuracy"],
    global_step_transform=global_step_from_engine(trainer),
)
```
### Integration with Hugging Face

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1YJsWXmpmJ8s6K9smqIFT7CnM27yjoPq3?usp=sharing)

In this guide, we will show you how to integrate Aim with Huggingface. The work we are going to do together is sentiment classification problem, which is the most common text classification task. We choose the IMDB movie review dataset as an experimental dataset, which classifies movie reviews as positive or negative. During the training process, we will show the use of aim to record effective information.

You only need 2 simple steps to employ Aim to collect data ❤️

Step 1: Import the sdk designed by Aim for Huggingface.

```python
from aim.hugging_face import AimCallback
```

Step 2: Huggingface has a trainer api to help us simplify the training process. This api provides a callback function to return the information that the user needs. Therefore, aim has specially designed SDK to simplify the process of user writing callback functions, we only need to initialize AimCallback object as follows:

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

### Integration with XGboost

In the real world, there is a well-known handwritten digit recognition problem. In this article, we use the machine learning framework xgboost to help us train an image classification model. In this process, we will use Aim to track our experimental data.

Enjoy using aim to track xgboost experimental data only requires two simple steps:

Step 1: Explicitly import the AimCallback for tracking training data.

```python
# call sdk aim.xgboost 
from aim.xgboost import AimCallback
```

Step 2: XGboost provides the xgboost.train method for model training, in which the callbacks parameter can call back data information from the outside. Here we pass in aimcallbacl designed for tracking data information

```python
xgboost.train(param, dtrain, num_round, watchlist,
                            callbacks=[AimCallback(experiment='xgboost_test')])
```

During the training process, you can start another terminal, in the same directory, start aim up, you can observe the information in real time.
