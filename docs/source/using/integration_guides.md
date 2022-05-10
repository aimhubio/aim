## Integration guides

Aim integrates seamlessly with your favorite ML frameworks - Pytorch Ignite, Pytorch Lightning, Hugging Face and others.
Basic integration guides can be found at [Quick Start](../quick_start/integrations.html) section. 

In this section we're going to deep-dive into the ways we can extend the basic loggers, manipulate them to track a lot more. The basic loggers can track specific metrics and hyper-params only.

There are two ways Aim callbacks/adapters/loggers can be extended:
- by deriving and overriding the main methods that are responsible for logging.
- by using public property called `experiment` which gives access to underlying `aim.Run` object to easily track new metrics, params and other metadata that would benefit your project.

### Pytorch Ignite
Both callback extension mechanisms are available with Pytorch Ignite.
In the example below you'll see how to use the experiment property to track confusion matrix as an image using `aim.Image` after the training is completed. 

Here is an [example colab notebook](https://colab.research.google.com/github/aimhubio/tutorials/blob/publication/notebooks/pytorch_ignite_track.ipynb). 

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

In the [example](https://github.com/aimhubio/aim/blob/main/examples/pytorch_lightning_track.py) provided in the Aim GitHub repo using `PL` + Aim there's already a reference how to customize an integration.

```python
    def test_step(self, batch, batch_idx):
        ...
        # Track metrics manually
        self.logger.experiment.track(1, name='manually_tracked_metric')
```

So you can track lots of metadata at each iteration of test step: images, texts, whatever is needed by you and supported by Aim.

### Hugging Face
Here is how to extend the basic Hugging Face logger. 
Below is an example of a `CustomCallback` that's derived from the `AimCallback`. The main HF method here is the `on_log()` that's overriden.

This allows us to track any `str` object that is passed to `on_log()` method as `aim.Text`.

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
Here is how to track confusion matrices with Aim while extending the default callback provided for `tf.keras`.
We have taken and adapted this [example.](https://www.tensorflow.org/tensorboard/image_summaries) to Aim. Here is how it looks:

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

Here is how to override the `AimCallback` for XGBoost.

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

### Catboost

Catboost's `.fit()` has `log_cout` parameter which can be used to redirect log output into a custom object
which has `write` attribute. Our logger is an object which implements `write` method to parse log string according to
its content. Thus, most of the log output will be ignored by our parser logic, but you still can code up your own logic
on top of ours to fill the gap for your needs.

```python
from aim.catboost import AimLogger


class CustomLogger(AimLogger):

    def write(self, log):
        # Process the log string through our parser
        super().write(log)

        # Do your own parsing
        log = log.strip().split()
        if log[1] == 'bin:':
            value_bin = log[1][4:]
            value_score = self._to_number(log[3])
            self.experiment.track(value_score, name='score')
```

### LightGBM

Here is how to override the `AimCallback` for LightGBM.

```python
from aim.lightgbm import AimCallback


class CustomCallback(AimCallback):

    def before_tracking(self, env):
        for item in env.evaluation_result_list:
            # manipulate item here
            pass

    def after_tracking(self, env):
        # do any other action if necessary after tracking value
        pass
```