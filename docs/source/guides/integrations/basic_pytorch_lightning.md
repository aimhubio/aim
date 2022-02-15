## Integration with Pytorch Lightning

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
