## Integration with Keras & tf.Keras

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
