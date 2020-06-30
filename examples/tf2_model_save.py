import aim
from aim import track
from aim.artifacts.utils import TfUtils

import tensorflow as tf

# Load and prepare MNIST
mnist = tf.keras.datasets.mnist

(x_train, y_train), (x_test, y_test) = mnist.load_data()
x_train, x_test = x_train / 255.0, x_test / 255.0

model = tf.keras.models.Sequential([
  tf.keras.layers.Flatten(input_shape=(28, 28)),
  tf.keras.layers.Dense(128, activation='relu'),
  tf.keras.layers.Dropout(0.2),
  tf.keras.layers.Dense(10)
])

class CustomCallback(tf.keras.callbacks.Callback):

  def on_epoch_end(self, epoch, logs=None):
    track(aim.checkpoint, 'checkpoint-test', 'mnist-'+str(epoch+1),
          self.model, epoch,
          meta={
            'classes':10,
            'loss': logs['loss']
          })

track(aim.checkpoint, 'checkpoint-test',
     'mnist-0', model, 0,
      meta={
        'classes': 10,
      })

predictions = model(x_train[:1]).numpy()

tf.nn.softmax(predictions).numpy()

loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)

model.compile(optimizer='adam',
              loss=loss_fn,
              metrics=['accuracy'])

model.fit(x_train, y_train, epochs=5, callbacks=[CustomCallback()])
model.evaluate(x_test,  y_test, verbose=2)

