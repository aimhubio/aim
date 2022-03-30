## Integration guides

Aim provides integrations with ML frameworks such as Pytorch Ignite, Pytorch Lightning, Hugging Face etc.
Basic guides can be found in [Quick Start](../quick_start/integrations.html) section. 
In this section we're going to talk more about how to extend and manipulate the basic integrations to suit the specific needs. 
In the basic form Aim is providing metric and hyper params logging mainly.
To be able to achieve this goal more knowledge of SDK provided by Aim is needed.
All necessary information can be found [here](../quick_start/supported_types.html) 

All the callbacks/adapters/loggers provided by Aim can be extended by deriving and overriding the main methods that are responsible for logging. 
Also, all callbacks/adapters/loggers have public property called `experiment` which gives access to underlying `aim.Run` object to easily track your own metrics and hyper params wherever and whenever you need them to.

### Pytorch Ignite
Both of the aforementioned ways of extending your integration and with Pytorch Ignite.
In the example below you'll see how to access the experiment property to track confusion matrix as an image using `aim.Image` after the training's completed. 
This can be added to the [example colab notebook](https://colab.research.google.com/github/aimhubio/tutorials/blob/publication/notebooks/pytorch_ignite_track.ipynb) we have provided as is done in the [original example](https://github.com/pytorch/ignite/blob/master/examples/notebooks/FashionMNIST.ipynb) of the Pytorch Ignite. 
```python
from aim import Image
from aim.pytorch_ignite import AimLogger

import matplotlib.pyplot as plt
import seaborn as sns

# Create a logger
aim_logger = AimLogger()
...
@trainer.on(Events.COMPLETED)
def log_confusion_matrix(trainer):
    metrics = val_evaluator.state.metrics
    cm = metrics['cm']
    cm = cm.numpy()
    cm = cm.astype(int)
    classes = ['T-shirt/top','Trouser','Pullover','Dress','Coat','Sandal','Shirt','Sneaker','Bag','Ankle Boot']
    fig, ax = plt.subplots(figsize=(10,10))  
    ax= plt.subplot()
    sns.heatmap(cm, annot=True, ax = ax,fmt="d")
    # labels, title and ticks
    ax.set_xlabel('Predicted labels')
    ax.set_ylabel('True labels') 
    ax.set_title('Confusion Matrix') 
    ax.xaxis.set_ticklabels(classes,rotation=90)
    ax.yaxis.set_ticklabels(classes,rotation=0)
    aim_logger.experiment.track(Image(fig), name='cm_training_end')
```

With Pytorch Ignite there's also a 3rd approach to extend the integration. 
For example Pytorch Ignite's Tensorboard logger provides a possibility to track model's gradients and weights as histograms. 
Same can be achieved with Aim
```python
from typing import Optional, Union

import torch.nn as nn
from ignite.contrib.handlers.base_logger import BaseWeightsHistHandler
from ignite.engine import Engine, Events

from aim.pytorch_ignite import AimLogger
from aim import Distribution


class AimGradsHistHandler(BaseWeightsHistHandler):
    def __init__(self, model: nn.Module, tag: Optional[str] = None):
        super(GradsHistHandler, self).__init__(model, tag=tag)

    def __call__(self, engine: Engine, logger: AimLogger, event_name: Union[str, Events]) -> None:
        global_step = engine.state.get_event_attrib_value(event_name)
        context = {'subset': self.tag} if self.tag else {}
        for name, p in self.model.named_parameters():
            if p.grad is None:
                continue
            name = name.replace(".", "/")
            logger.experiment.track(
                Distribution(p.grad.detach().cpu().numpy()),
                name=name,
                step=global_step, 
                context=context
            )

# Create a logger
aim_logger = AimLogger()

# Attach the logger to the trainer to log model's weights norm after each iteration
aim_logger.attach(
    trainer,
    event_name=Events.ITERATION_COMPLETED,
    log_handler=AimGradsHistHandler(model)
)
```

### Pytorch Lightning

In the [example](https://github.com/aimhubio/aim/blob/main/examples/pytorch_lightning_track.py) provided in our GitHub repo using `PL` + Aim there's already a reference how to customize an integration.

```python
    def test_step(self, batch, batch_idx):
        ...
        # Track metrics manually
        self.logger.experiment.track(1, name='manually_tracked_metric')
```

So at each iteration of testing step anything can be tracked: images, texts, whatever is needed by you and supported by Aim.
### Hugging Face
Let's examine the other possible example of extending the basic provided integration with Hugging Face. 
Below is an example of deriving from the original `Callback` provided by Aim and overriding the main method, which in case of HF is `on_log()`.
This will allow us to track any `str` object that is passed to `on_log()` method as `aim.Text`.

```python
from aim.hugging_face import AimCallback
from aim import Text


class CustomCallback(AimCallback):
    def on_log(self, args, state, control,
               model=None, logs=None, **kwargs):
        super().on_log(args, state, control, model, logs, **kwargs)

        context = {
            'subset': self._current_shift,
        }
        for log_name, log_value in logs.items():
            if isinstance(log_value, str):
                self.experiment.track(Text(log_value), name=log_name, context=context)

```
### TF/keras
We'll show how to track confusion matrices with Aim while extending the default callback provided for `tf.keras` by examining how to the same with Aim as is provided in this [example.](https://www.tensorflow.org/tensorboard/image_summaries) 
```python
from aim.tensorflow import AimCallback

class CustomImageTrackingCallback(AimCallback):
    def __init__(self, data):
        super().__init__()
        self.data = data

    def on_epoch_end(self, epoch, logs=None):
        super().on_epoch_end(epoch, logs)
        from aim import Image
        # Use the model to predict the values from the validation dataset.
        test_pred_raw = self.model.predict(test_images)
        test_pred = np.argmax(test_pred_raw, axis=1)

        # Calculate the confusion matrix.
        cm = sklearn.metrics.confusion_matrix(test_labels, test_pred)
        # Log the confusion matrix as an image summary.
        figure = plot_confusion_matrix(cm, class_names=class_names)
        cm_image = Image(figure)

        # Log the confusion matrix as an Aim image.
        self.experiment.track(cm_image,"Confusion Matrix", step=epoch)

aim_callback = CustomImageTrackingCallback()

model.fit(
    train_images,
    train_labels,
    epochs=5,
    verbose=0, # Suppress chatty output
    callbacks=[aim_callback],
    validation_data=(test_images, test_labels),
)

```

### XGBoost

And another example for extending the basic provided integration with XGBoost. Below is an example of deriving from the
original Callback provided by Aim and overriding required method.

```python
from aim import Text
from aim.xgboost import AimCallback


class CustomCallback(AimCallback):

    def after_iteration(self, model, epoch, evals_log):
        for data, metric in evals_log.items():
            for metric_name, log in metric.items():
                self.experiment.track(Text(log), name=metric_name)
        
        return super().after_iteration(model, epoch, evals_log)
```
