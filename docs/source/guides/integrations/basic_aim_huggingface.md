### Integration with Huggingface

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






